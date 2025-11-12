/**
 * Database Verification Script
 * 
 * This script provides a comprehensive summary of the migrated data
 * without requiring manual inspection of individual entries.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n========================================');
    console.log('DATABASE VERIFICATION REPORT');
    console.log('========================================\n');

    // 1. Projects Summary
    console.log('1. PROJECTS');
    console.log('─'.repeat(50));
    const projects = await prisma.project.findMany({
      include: {
        _count: {
          select: {
            tasks: true,
            sessions: true,
            editHistoryEntries: true,
            errors: true,
            activeContexts: true,
            progress: true,
            changelogEntries: true
          }
        }
      }
    });

    for (const project of projects) {
      console.log(`\n📦 Project: ${project.name}`);
      console.log(`   Path: ${project.path}`);
      console.log(`   Tasks: ${project._count.tasks}`);
      console.log(`   Sessions: ${project._count.sessions}`);
      console.log(`   Edit Entries: ${project._count.editHistoryEntries}`);
      console.log(`   Errors: ${project._count.errors}`);
      console.log(`   Contexts: ${project._count.activeContexts}`);
      console.log(`   Progress: ${project._count.progress}`);
      console.log(`   Changelog: ${project._count.changelogEntries}`);
    }

    // 2. Tasks Summary
    console.log('\n\n2. TASKS');
    console.log('─'.repeat(50));
    const tasks = await prisma.task.findMany({
      include: {
        _count: {
          select: {
            dependencies: true,
            dependents: true,
            relatedFiles: true,
            editHistoryEntries: true,
            errors: true,
            sessions: true
          }
        }
      },
      orderBy: { id: 'asc' }
    });

    console.log(`\nTotal Tasks: ${tasks.length}\n`);

    const statusCounts = {};
    const priorityCounts = {};

    for (const task of tasks) {
      statusCounts[task.status] = (statusCounts[task.status] || 0) + 1;
      priorityCounts[task.priority] = (priorityCounts[task.priority] || 0) + 1;

      console.log(`${task.id}: ${task.title}`);
      console.log(`   Status: ${task.status} | Priority: ${task.priority}`);
      console.log(`   Dependencies: ${task._count.dependents} → ${task._count.dependencies}`);
      console.log(`   Files: ${task._count.relatedFiles} | Edits: ${task._count.editHistoryEntries} | Errors: ${task._count.errors}`);
    }

    console.log(`\n📊 Status Distribution:`);
    for (const [status, count] of Object.entries(statusCounts)) {
      console.log(`   ${status}: ${count}`);
    }

    console.log(`\n📊 Priority Distribution:`);
    for (const [priority, count] of Object.entries(priorityCounts)) {
      console.log(`   ${priority}: ${count}`);
    }

    // 3. Dependencies
    console.log('\n\n3. TASK DEPENDENCIES');
    console.log('─'.repeat(50));
    const dependencies = await prisma.taskDependency.findMany({
      include: {
        dependingTask: { select: { id: true, title: true } },
        dependedTask: { select: { id: true, title: true } }
      }
    });

    console.log(`\nTotal Dependencies: ${dependencies.length}\n`);
    for (const dep of dependencies) {
      console.log(`${dep.dependingTask.id} → ${dep.dependedTask.id}`);
    }

    // 4. Sessions Summary
    console.log('\n\n4. SESSIONS');
    console.log('─'.repeat(50));
    const sessions = await prisma.session.findMany({
      include: {
        _count: {
          select: { tasks: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    console.log(`\nTotal Sessions: ${(await prisma.session.count())}`);
    console.log(`(Showing last 10)\n`);

    for (const session of sessions) {
      console.log(`Session: ${session.id.substring(0, 8)}...`);
      console.log(`   Created: ${session.createdAt.toISOString()}`);
      console.log(`   Status: ${session.status}`);
      console.log(`   Tasks: ${session._count.tasks}`);
    }

    // 5. Edit History Summary
    console.log('\n\n5. EDIT HISTORY');
    console.log('─'.repeat(50));
    const editCount = await prisma.editHistoryEntry.count();
    
    const editEntries = await prisma.editHistoryEntry.findMany({
      select: { taskId: true }
    });
    
    const editByTaskMap = {};
    for (const entry of editEntries) {
      const taskId = entry.taskId || 'No Task';
      editByTaskMap[taskId] = (editByTaskMap[taskId] || 0) + 1;
    }
    
    const sorted = Object.entries(editByTaskMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log(`\nTotal Edit Entries: ${editCount}\n`);
    console.log('Top 10 Most-Edited Tasks:');
    for (const [task, count] of sorted) {
      console.log(`   ${task}: ${count} edits`);
    }

    // 6. Errors Summary
    console.log('\n\n6. ERRORS');
    console.log('─'.repeat(50));
    const errors = await prisma.error.findMany({
      include: {
        _count: {
          select: { affectedFiles: true }
        }
      },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    const totalErrors = await prisma.error.count();
    console.log(`\nTotal Errors: ${totalErrors}`);
    console.log(`(Showing last 10)\n`);

    for (const error of errors) {
      console.log(`${error.title || 'Untitled Error'}`);
      console.log(`   Task: ${error.taskId || 'No Task'}`);
      console.log(`   File: ${error.filePath || 'N/A'}`);
      console.log(`   Affected Files: ${error._count.affectedFiles}`);
      console.log(`   Timestamp: ${error.timestamp.toISOString()}`);
    }

    // 7. Data Integrity Checks
    console.log('\n\n7. DATA INTEGRITY CHECKS');
    console.log('─'.repeat(50));

    const orphanSessions = await prisma.sessionTask.findMany({
      where: {
        task: {
          id: { notIn: tasks.map(t => t.id) }
        }
      }
    });

    const orphanEditEntries = await prisma.editHistoryEntry.findMany({
      where: {
        taskId: { notIn: tasks.map(t => t.id) }
      }
    });

    const orphanErrors = await prisma.error.findMany({
      where: {
        taskId: { notIn: tasks.map(t => t.id) }
      }
    });

    console.log(`\n✅ Orphaned Session Tasks: ${orphanSessions.length}`);
    console.log(`✅ Orphaned Edit Entries: ${orphanEditEntries.length}`);
    console.log(`✅ Orphaned Error Entries: ${orphanErrors.length}`);

    // Check for circular dependencies
    console.log(`\n🔍 Circular Dependencies: Checking...`);
    const circularDeps = [];
    for (const dep of dependencies) {
      const reverse = dependencies.find(
        d => d.dependingTaskId === dep.dependedTaskId && d.dependedTaskId === dep.dependingTaskId
      );
      if (reverse && !circularDeps.includes(dep.id)) {
        circularDeps.push(dep.id);
      }
    }
    console.log(`✅ Found: ${circularDeps.length}`);

    // 8. Summary Statistics
    console.log('\n\n8. SUMMARY STATISTICS');
    console.log('─'.repeat(50));
    console.log(`\nTotal Records by Type:`);
    console.log(`   Projects: ${projects.length}`);
    console.log(`   Tasks: ${tasks.length}`);
    console.log(`   Sessions: ${await prisma.session.count()}`);
    console.log(`   Edit Entries: ${editCount}`);
    console.log(`   Errors: ${totalErrors}`);
    console.log(`   Active Contexts: ${await prisma.activeContext.count()}`);
    console.log(`   Progress Records: ${await prisma.progress.count()}`);
    console.log(`   Changelog Entries: ${await prisma.changelogEntry.count()}`);
    console.log(`   Dependencies: ${dependencies.length}`);

    const totalRecords = projects.length + tasks.length + 
                        (await prisma.session.count()) + editCount + 
                        totalErrors + (await prisma.activeContext.count()) +
                        (await prisma.progress.count()) + 
                        (await prisma.changelogEntry.count());

    console.log(`\n📊 TOTAL RECORDS: ${totalRecords}`);

    console.log('\n========================================');
    console.log('VERIFICATION COMPLETE');
    console.log('========================================\n');

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
