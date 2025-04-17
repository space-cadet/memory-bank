/**
 * Markdown to Database Conversion Script
 * 
 * This script converts the existing markdown files to database entries using Prisma.
 * It handles tasks.md, session_cache.md, edit_history.md, errorLog.md, activeContext.md,
 * and other memory bank files.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const memoryBankDir = path.join(__dirname, '../../');
const examplesDir = path.join(__dirname, '../../../examples');

// Utility functions
function extractDate(dateString) {
  if (!dateString) return null;
  
  try {
    // Handle various date formats
    // Examples: "April 15, 2025", "2025-04-15", "2025-04-15 12:30 UTC"
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn(`Invalid date string: "${dateString}", using current date instead`);
      return new Date(); // Return current date as fallback
    }
    
    return date;
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return new Date(); // Return current date as fallback
  }
}

function parseTaskStatus(statusText) {
  if (!statusText) return 'PLANNED';
  
  if (statusText.includes('✅') || statusText.toLowerCase().includes('done') || statusText.toLowerCase().includes('complete')) {
    return 'DONE';
  } else if (statusText.includes('🔄') || statusText.toLowerCase().includes('in progress')) {
    return 'IN_PROGRESS';
  } else if (statusText.includes('⏸️') || statusText.toLowerCase().includes('paused')) {
    return 'PAUSED';
  } else {
    return 'PLANNED';
  }
}

// Conversion functions
async function convertTasks(projectId, dirPath = memoryBankDir) {
  console.log('Converting tasks.md...');
  
  const tasksPath = path.join(dirPath, 'tasks.md');
  if (!fs.existsSync(tasksPath)) {
    console.log('tasks.md not found, skipping');
    return;
  }
  
  const content = fs.readFileSync(tasksPath, 'utf8');
  
  // Extract task IDs and titles from the table
  const taskTableRegex = /\|\s*([T\d]+)\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|/g;
  const taskMatches = [...content.matchAll(taskTableRegex)];
  
  // Extract detailed task information from the sections
  const taskSectionRegex = /### ([T\d]+): (.+?)(?=\n\*\*Description\*\*)/g;
  const taskDetailRegex = /\*\*([^:]+):\*\*\s*([\s\S]*?)(?=\n\*\*|$)/g;
  
  for (const taskMatch of [...content.matchAll(taskSectionRegex)]) {
    const taskId = taskMatch[1];
    const title = taskMatch[2].trim();
    const taskSection = content.substring(taskMatch.index);
    const nextTaskIndex = taskSection.indexOf('### T', 10); // Skip the current task header
    
    const taskContent = nextTaskIndex !== -1 
      ? taskSection.substring(0, nextTaskIndex) 
      : taskSection;
    
    // Parse task details
    const details = {};
    for (const detailMatch of [...taskContent.matchAll(taskDetailRegex)]) {
      const key = detailMatch[1].trim().toLowerCase();
      const value = detailMatch[2].trim();
      details[key] = value;
    }
    
    // Parse related files
    const relatedFiles = [];
    if (details['related files']) {
      const fileLines = details['related files'].split('\n');
      for (const line of fileLines) {
        // Try to extract file path using regex for markdown list items and code blocks
        const fileMatch = line.match(/[-*]\s+`([^`]+)`|[-*]\s+(.+)/);
        if (fileMatch) {
          const filePath = fileMatch[1] || fileMatch[2];
          if (filePath && !filePath.trim().startsWith('-') && filePath.trim().length > 0) {
            relatedFiles.push({ path: filePath.trim(), isPlanned: line.includes('(planned)') });
          }
        }
      }
    }
    
    // Parse completion criteria
    let completionCriteria = [];
    if (details['completion criteria']) {
      const criteriaLines = details['completion criteria'].split('\n');
      for (const line of criteriaLines) {
        const criteriaMatch = line.match(/[-*]\s+(.+)/);
        if (criteriaMatch && criteriaMatch[1].trim().length > 0) {
          completionCriteria.push(criteriaMatch[1].trim());
        }
      }
    }
    
    // Create task in database
    try {
      // Check if task already exists
      const existingTask = await prisma.task.findUnique({
        where: { id: taskId },
      });
      
      if (existingTask) {
        console.log(`Task ${taskId} already exists, updating...`);
        await prisma.task.update({
          where: { id: taskId },
          data: {
            title,
            description: details.description || '',
            status: parseTaskStatus(details.status),
            priority: details.priority?.toUpperCase() || null,
            startedAt: details.started ? extractDate(details.started) : null,
            completedAt: details.completed ? extractDate(details.completed) : null,
            lastActiveAt: details['last active'] ? extractDate(details['last active']) : null,
            pausedAt: details['paused on'] ? extractDate(details['paused on']) : null,
            pausedReason: details['reason'] || null,
            owner: details.owner || null,
            completionCriteria: completionCriteria.length > 0 ? completionCriteria : null,
            notes: details.notes || null,
          },
        });
      } else {
        console.log(`Creating task ${taskId}...`);
        await prisma.task.create({
          data: {
            id: taskId,
            title,
            description: details.description || '',
            status: parseTaskStatus(details.status),
            priority: details.priority?.toUpperCase() || null,
            startedAt: details.started ? extractDate(details.started) : null,
            completedAt: details.completed ? extractDate(details.completed) : null,
            lastActiveAt: details['last active'] ? extractDate(details['last active']) : null,
            pausedAt: details['paused on'] ? extractDate(details['paused on']) : null,
            pausedReason: details['reason'] || null,
            owner: details.owner || null,
            completionCriteria: completionCriteria.length > 0 ? completionCriteria : null,
            notes: details.notes || null,
            projectId,
          },
        });
      }
      
      // Add related files
      for (const file of relatedFiles) {
        const existingFile = await prisma.relatedFile.findFirst({
          where: {
            taskId,
            path: file.path,
          },
        });
        
        if (!existingFile) {
          await prisma.relatedFile.create({
            data: {
              path: file.path,
              isPlanned: file.isPlanned,
              taskId,
            },
          });
        }
      }
      
    } catch (error) {
      console.error(`Error creating task ${taskId}:`, error);
    }
  }
  
  // Parse task dependencies from the mermaid graph if present
  const mermaidGraphRegex = /```mermaid\s+graph TD\s+([\s\S]+?)```/;
  const mermaidMatch = content.match(mermaidGraphRegex);
  
  if (mermaidMatch) {
    const graphContent = mermaidMatch[1];
    const dependencyRegex = /\s+([T\d]+)\s*-->\s*([T\d]+)/g;
    
    for (const depMatch of [...graphContent.matchAll(dependencyRegex)]) {
      const dependingTaskId = depMatch[1];
      const dependedTaskId = depMatch[2];
      
      // Check if both tasks exist
      const dependingTask = await prisma.task.findUnique({ where: { id: dependingTaskId } });
      const dependedTask = await prisma.task.findUnique({ where: { id: dependedTaskId } });
      
      if (dependingTask && dependedTask) {
        // Check if dependency already exists
        const existingDep = await prisma.taskDependency.findFirst({
          where: {
            dependingTaskId,
            dependedTaskId,
          },
        });
        
        if (!existingDep) {
          await prisma.taskDependency.create({
            data: {
              dependingTaskId,
              dependedTaskId,
              relationshipType: 'DEPENDS_ON',
            },
          });
          console.log(`Created dependency: ${dependingTaskId} -> ${dependedTaskId}`);
        }
      }
    }
  }
  
  console.log('Tasks conversion completed.');
}
async function convertSessionCache(projectId, dirPath = memoryBankDir) {
  console.log('Converting session_cache.md...');
  
  const sessionCachePath = path.join(dirPath, 'session_cache.md');
  if (!fs.existsSync(sessionCachePath)) {
    console.log('session_cache.md not found, skipping');
    return;
  }
  
  const content = fs.readFileSync(sessionCachePath, 'utf8');
  const { data, content: sessionContent } = matter(content);
  
  // Extract session data
  let status = 'CONTINUING';
  if (data && data.status) {
    status = data.status.toUpperCase();
  } else {
    // Try to extract status from content
    const statusMatch = sessionContent.match(/## Status\s+(.*)/);
    if (statusMatch) {
      status = statusMatch[1].trim().toUpperCase();
    }
  }
  
  // Extract last updated date
  let updatedAt = new Date();
  const updatedMatch = content.match(/\*Last Updated: ([^*]+)\*/);
  if (updatedMatch) {
    updatedAt = extractDate(updatedMatch[1].trim()) || updatedAt;
  }
  
  // Create session
  const session = await prisma.session.create({
    data: {
      status,
      updatedAt,
      notes: data.notes || '',
      implementationFocus: data.implementationFocus || '',
      projectId,
    },
  });
  
  // Extract task information
  const taskSectionRegex = /### ([T\d]+): (.+?)(?=\n\*\*Status\*\*)/g;
  const taskDetailRegex = /\*\*([^:]+):\*\*\s*([\s\S]*?)(?=\n\*\*|$)/g;
  
  for (const taskMatch of [...sessionContent.matchAll(taskSectionRegex)]) {
    const taskId = taskMatch[1];
    const taskSection = sessionContent.substring(taskMatch.index);
    const nextTaskIndex = taskSection.indexOf('### T', 10); // Skip the current task header
    
    const taskContent = nextTaskIndex !== -1 
      ? taskSection.substring(0, nextTaskIndex) 
      : taskSection;
    
    // Parse task details
    const details = {};
    for (const detailMatch of [...taskContent.matchAll(taskDetailRegex)]) {
      const key = detailMatch[1].trim().toLowerCase();
      const value = detailMatch[2].trim();
      details[key] = value;
    }
    
    // Look for implementation progress section
    let stepProgress = [];
    const progressMatch = taskContent.match(/#### Implementation Progress\s+([\s\S]*?)(?=\n####|$)/);
    if (progressMatch) {
      const progressContent = progressMatch[1];
      const progressLineRegex = /\d+\.\s+(✅|🔄|⬜)\s+\[([^\]]+)\]/g;
      
      for (const lineMatch of [...progressContent.matchAll(progressLineRegex)]) {
        const status = lineMatch[1] === '✅' ? 'COMPLETE' : lineMatch[1] === '🔄' ? 'IN_PROGRESS' : 'PLANNED';
        const step = lineMatch[2].trim();
        stepProgress.push({ step, status });
      }
    }
    
    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });
    
    if (task) {
      // Create session-task relationship
      await prisma.sessionTask.create({
        data: {
          sessionId: session.id,
          taskId,
          isFocus: true, // Assuming each task is a focus in its section
          stepProgress: stepProgress.length > 0 ? stepProgress : null,
          contextNotes: details.context || null,
        },
      });
    }
  }
  
  console.log('Session cache conversion completed.');
}
async function convertEditHistory(projectId, dirPath = memoryBankDir) {
  console.log('Converting edit_history.md...');
  
  const editHistoryPath = path.join(dirPath, 'edit_history.md');
  if (!fs.existsSync(editHistoryPath)) {
    console.log('edit_history.md not found, skipping');
    return;
  }
  
  const content = fs.readFileSync(editHistoryPath, 'utf8');
  
  // Extract date sections
  const dateSectionRegex = /### ([A-Za-z]+ \d+, \d+)\s+([\s\S]*?)(?=\n### |$)/g;
  
  for (const dateMatch of [...content.matchAll(dateSectionRegex)]) {
    const dateStr = dateMatch[1];
    const dateContent = dateMatch[2];
    
    // Extract time sections within each date
    const timeSectionRegex = /#### ([0-9:]+)\s*-\s*(?:\[([T\d]+)\]:?)?\s*(.+?)(?=\n-|\n####|$)/g;
    
    for (const timeMatch of [...dateContent.matchAll(timeSectionRegex)]) {
      const timeStr = timeMatch[1];
      const taskId = timeMatch[2] || null;
      const description = timeMatch[3].trim();
      
      // Create timestamp
      const timestamp = extractDate(`${dateStr} ${timeStr}`) || new Date();
      
      // Extract file modifications
      const fileModRegex = /-\s+(Created|Modified|Updated|Deleted)\s+`([^`]+)`\s*-\s*(.+?)(?=\n-|\n####|$)/g;
      const modifications = [];
      
      const entrySectionContent = dateContent.substring(timeMatch.index + timeMatch[0].length);
      const nextSectionIndex = entrySectionContent.search(/\n#### /);
      const entryContent = nextSectionIndex !== -1 
        ? entrySectionContent.substring(0, nextSectionIndex) 
        : entrySectionContent;
      
      for (const modMatch of [...entryContent.matchAll(fileModRegex)]) {
        const action = modMatch[1].toUpperCase();
        const filePath = modMatch[2];
        const modDescription = modMatch[3].trim();
        
        modifications.push({
          action,
          path: filePath,
          description: modDescription,
        });
      }
      
      // Create edit history entry
      if (modifications.length > 0) {
        try {
          const entry = await prisma.editHistoryEntry.create({
            data: {
              timestamp,
              description,
              taskId,
              projectId,
            },
          });
          
          // Create file modifications
          for (const mod of modifications) {
            await prisma.fileModification.create({
              data: {
                path: mod.path,
                action: mod.action,
                description: mod.description,
                editHistoryEntryId: entry.id,
              },
            });
          }
          
          console.log(`Created edit history entry for ${dateStr} ${timeStr}`);
        } catch (error) {
          console.error(`Error creating edit history entry:`, error);
        }
      }
    }
  }
  
  console.log('Edit history conversion completed.');
}
async function convertErrorLog(projectId, dirPath = memoryBankDir) {
  console.log('Converting errorLog.md...');
  
  const errorLogPath = path.join(dirPath, 'errorLog.md');
  if (!fs.existsSync(errorLogPath)) {
    console.log('errorLog.md not found, skipping');
    return;
  }
  
  const content = fs.readFileSync(errorLogPath, 'utf8');
  
  // Extract error entries
  const errorEntryRegex = /## ([0-9-]+ [0-9:]+)(?:\s+[A-Z]+)?(?:\s*-\s*(?:\[([T\d]+)\]:?)?\s*)?([^\n]+)\s+([\s\S]*?)(?=\n## |$)/g;
  
  for (const errorMatch of [...content.matchAll(errorEntryRegex)]) {
    const timestampStr = errorMatch[1];
    const taskId = errorMatch[2] || null;
    const title = errorMatch[3].trim();
    const errorContent = errorMatch[4];
    
    // Extract file path
    let filePath = null;
    const filePathMatch = errorContent.match(/\*\*File:\*\*\s*`([^`]+)`/);
    if (filePathMatch) {
      filePath = filePathMatch[1];
    }
    
    // Extract error message
    let errorMessage = null;
    const errorMessageMatch = errorContent.match(/\*\*Error Message:\*\*\s*```\s*([\s\S]*?)```/);
    if (errorMessageMatch) {
      errorMessage = errorMessageMatch[1].trim();
    }
    
    // Extract cause
    let cause = '';
    const causeMatch = errorContent.match(/\*\*Cause:\*\*\s*([\s\S]*?)(?=\n\*\*Fix:|$)/);
    if (causeMatch) {
      cause = causeMatch[1].trim();
    }
    
    // Extract fix
    let fix = '';
    const fixMatch = errorContent.match(/\*\*Fix:\*\*\s*([\s\S]*?)(?=\n\*\*Key Code Changes:|$)/);
    if (fixMatch) {
      fix = fixMatch[1].trim();
    }
    
    // Extract key code changes
    let keyCodeChanges = null;
    const keyCodeMatch = errorContent.match(/\*\*Key Code Changes:\*\*\s*```[a-z]*\s*([\s\S]*?)```/);
    if (keyCodeMatch) {
      keyCodeChanges = keyCodeMatch[1].trim();
    }
    
    // Extract affected files
    const affectedFiles = [];
    const affectedFilesMatch = errorContent.match(/\*\*Affected Files:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
    if (affectedFilesMatch) {
      const affectedFilesContent = affectedFilesMatch[1];
      const fileLineRegex = /-\s+([^\n]+)/g;
      
      for (const fileMatch of [...affectedFilesContent.matchAll(fileLineRegex)]) {
        const filePath = fileMatch[1].trim();
        if (filePath.startsWith('`') && filePath.endsWith('`')) {
          affectedFiles.push(filePath.substring(1, filePath.length - 1));
        } else {
          affectedFiles.push(filePath);
        }
      }
    }
    
    // Create error entry
    try {
      const timestamp = extractDate(timestampStr) || new Date();
      
      const error = await prisma.error.create({
        data: {
          timestamp,
          title,
          filePath,
          errorDescription: cause,
          errorMessage,
          cause,
          fix,
          keyCodeChanges,
          taskId,
          projectId,
        },
      });
      
      // Create affected files
      for (const file of affectedFiles) {
        await prisma.affectedFile.create({
          data: {
            path: file,
            errorId: error.id,
          },
        });
      }
      
      console.log(`Created error entry: ${title}`);
    } catch (error) {
      console.error(`Error creating error entry:`, error);
    }
  }
  
  console.log('Error log conversion completed.');
}
async function convertActiveContext(projectId, dirPath = memoryBankDir) {
  console.log('Converting activeContext.md...');
  
  const activeContextPath = path.join(dirPath, 'activeContext.md');
  if (!fs.existsSync(activeContextPath)) {
    console.log('activeContext.md not found, skipping');
    return;
  }
  
  const content = fs.readFileSync(activeContextPath, 'utf8');
  const { data } = matter(content);
  
  // Extract implementation focus
  let implementationFocus = '';
  const focusMatch = content.match(/## Implementation Focus\s+([\s\S]*?)(?=\n##|$)/);
  if (focusMatch) {
    implementationFocus = focusMatch[1].trim();
  }
  
  // Extract current decisions
  const currentDecisions = [];
  const decisionsMatch = content.match(/## Current Decisions\s+([\s\S]*?)(?=\n##|$)/);
  if (decisionsMatch) {
    const decisionsContent = decisionsMatch[1];
    const decisionRegex = /-\s+([^\n]+)/g;
    
    for (const decMatch of [...decisionsContent.matchAll(decisionRegex)]) {
      currentDecisions.push(decMatch[1].trim());
    }
  }
  
  // Extract next actions
  const nextActions = [];
  const actionsMatch = content.match(/## Next Actions\s+([\s\S]*?)(?=\n##|$)/);
  if (actionsMatch) {
    const actionsContent = actionsMatch[1];
    const actionRegex = /-\s+([^\n]+)/g;
    
    for (const actMatch of [...actionsContent.matchAll(actionRegex)]) {
      nextActions.push(actMatch[1].trim());
    }
  }
  
  // Extract updated date
  let updatedAt = new Date();
  const updatedMatch = content.match(/\*Last Updated: ([^*]+)\*/);
  if (updatedMatch) {
    updatedAt = extractDate(updatedMatch[1].trim()) || updatedAt;
  }
  
  // Create active context
  try {
    await prisma.activeContext.create({
      data: {
        implementationFocus,
        currentDecisions: currentDecisions.length > 0 ? currentDecisions : null,
        nextActions: nextActions.length > 0 ? nextActions : null,
        createdAt: updatedAt,
        updatedAt,
        projectId,
      },
    });
    
    console.log('Created active context entry');
  } catch (error) {
    console.error('Error creating active context entry:', error);
  }
  
  console.log('Active context conversion completed.');
}
async function convertProgress(projectId, dirPath = memoryBankDir) {
  console.log('Converting progress.md...');
  
  const progressPath = path.join(dirPath, 'progress.md');
  if (!fs.existsSync(progressPath)) {
    console.log('progress.md not found, skipping');
    return;
  }
  
  const content = fs.readFileSync(progressPath, 'utf8');
  const { data } = matter(content);
  
  // Extract milestones
  const milestones = [];
  const milestonesMatch = content.match(/## Milestones\s+([\s\S]*?)(?=\n##|$)/);
  if (milestonesMatch) {
    const milestonesContent = milestonesMatch[1];
    const milestoneRegex = /-\s+\[([ x])\]\s+([^\n]+)/g;
    
    for (const mileMatch of [...milestonesContent.matchAll(milestoneRegex)]) {
      const completed = mileMatch[1] === 'x';
      const description = mileMatch[2].trim();
      milestones.push({ description, completed });
    }
  }
  
  // Extract known issues
  const knownIssues = [];
  const issuesMatch = content.match(/## Known Issues\s+([\s\S]*?)(?=\n##|$)/);
  if (issuesMatch) {
    const issuesContent = issuesMatch[1];
    const issueRegex = /-\s+([^\n]+)/g;
    
    for (const issueMatch of [...issuesContent.matchAll(issueRegex)]) {
      knownIssues.push(issueMatch[1].trim());
    }
  }
  
  // Extract goals
  const goals = [];
  const goalsMatch = content.match(/## Goals\s+([\s\S]*?)(?=\n##|$)/);
  if (goalsMatch) {
    const goalsContent = goalsMatch[1];
    const goalRegex = /-\s+([^\n]+)/g;
    
    for (const goalMatch of [...goalsContent.matchAll(goalRegex)]) {
      goals.push(goalMatch[1].trim());
    }
  }
  
  // Extract updated date
  let updatedAt = new Date();
  const updatedMatch = content.match(/\*Last Updated: ([^*]+)\*/);
  if (updatedMatch) {
    updatedAt = extractDate(updatedMatch[1].trim()) || updatedAt;
  }
  
  // Create progress
  try {
    await prisma.progress.create({
      data: {
        updatedAt,
        milestones: milestones.length > 0 ? milestones : null,
        knownIssues: knownIssues.length > 0 ? knownIssues : null,
        goals: goals.length > 0 ? goals : null,
        projectId,
      },
    });
    
    console.log('Created progress entry');
  } catch (error) {
    console.error('Error creating progress entry:', error);
  }
  
  console.log('Progress conversion completed.');
}
async function convertProjectBrief(projectId, dirPath = memoryBankDir) {
  console.log('Converting projectbrief.md...');
  
  const briefPath = path.join(dirPath, 'projectbrief.md');
  if (!fs.existsSync(briefPath)) {
    console.log('projectbrief.md not found, skipping');
    return;
  }
  
  const content = fs.readFileSync(briefPath, 'utf8');
  const { data } = matter(content);
  
  // Extract overview
  let overview = '';
  const overviewMatch = content.match(/## Overview\s+([\s\S]*?)(?=\n##|$)/);
  if (overviewMatch) {
    overview = overviewMatch[1].trim();
  }
  
  // Extract objectives
  const objectives = [];
  const objectivesMatch = content.match(/## Core Requirements\s+([\s\S]*?)(?=\n##|$)/);
  if (objectivesMatch) {
    const objContent = objectivesMatch[1];
    // Find main objectives (### headings)
    const mainObjRegex = /### [\d.]+\s+([^\n]+)\s+([\s\S]*?)(?=\n###|$)/g;
    
    for (const objMatch of [...objContent.matchAll(mainObjRegex)]) {
      const title = objMatch[1].trim();
      const details = objMatch[2].trim();
      objectives.push({ title, details });
    }
  }
  
  // Extract key files
  const keyFiles = [];
  const filesMatch = content.match(/## Key Files\s+([\s\S]*?)(?=\n##|$)/);
  if (filesMatch) {
    const filesContent = filesMatch[1];
    const fileRegex = /-\s+`([^`]+)`\s*:\s*([^\n]+)/g;
    
    for (const fileMatch of [...filesContent.matchAll(fileRegex)]) {
      const path = fileMatch[1].trim();
      const description = fileMatch[2].trim();
      keyFiles.push({ path, description });
    }
  }
  
  // Extract architecture
  let architecture = null;
  const archMatch = content.match(/## Architecture\s+([\s\S]*?)(?=\n##|$)/);
  if (archMatch) {
    architecture = archMatch[1].trim();
  }
  
  // Extract technologies
  const technologies = [];
  const techMatch = content.match(/## (Technologies|Tech Stack)\s+([\s\S]*?)(?=\n##|$)/);
  if (techMatch) {
    const techContent = techMatch[2];
    const techRegex = /-\s+([^\n]+)/g;
    
    for (const tMatch of [...techContent.matchAll(techRegex)]) {
      technologies.push(tMatch[1].trim());
    }
  }
  
  // Extract updated date
  let updatedAt = new Date();
  const updatedMatch = content.match(/\*Last Updated: ([^*]+)\*/);
  if (updatedMatch) {
    updatedAt = extractDate(updatedMatch[1].trim()) || updatedAt;
  }
  
  // Create project brief
  try {
    await prisma.projectBrief.create({
      data: {
        updatedAt,
        overview,
        objectives: objectives.length > 0 ? objectives : null,
        keyFiles: keyFiles.length > 0 ? keyFiles : null,
        architecture,
        technologies: technologies.length > 0 ? technologies : null,
        projectId,
      },
    });
    
    console.log('Created project brief entry');
  } catch (error) {
    console.error('Error creating project brief entry:', error);
  }
  
  console.log('Project brief conversion completed.');
}
async function convertChangelog(projectId, dirPath = memoryBankDir) {
  console.log('Converting changelog.md...');
  
  const changelogPath = path.join(dirPath, 'changelog.md');
  if (!fs.existsSync(changelogPath)) {
    console.log('changelog.md not found, skipping');
    return;
  }
  
  const content = fs.readFileSync(changelogPath, 'utf8');
  
  // Extract version sections
  const versionRegex = /## \[?([^\]\s]+)\]?\s*-\s*([^\n]+)\s+([\s\S]*?)(?=\n## |$)/g;
  
  for (const versionMatch of [...content.matchAll(versionRegex)]) {
    const version = versionMatch[1].trim();
    const dateStr = versionMatch[2].trim();
    const changeContent = versionMatch[3];
    
    // Parse date - ensure it's valid
    let date;
    try {
      // If dateStr is empty or invalid, use current date
      date = dateStr ? new Date(dateStr) : new Date();
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        console.warn(`Invalid date in changelog for version ${version}: "${dateStr}", using current date`);
        date = new Date();
      }
    } catch (error) {
      console.warn(`Error parsing date in changelog for version ${version}: "${dateStr}", using current date`);
      date = new Date();
    }
    
    // Extract changes
    const changes = [];
    const sectionRegex = /### ([^\n]+)\s+([\s\S]*?)(?=\n###|$)/g;
    
    for (const sectionMatch of [...changeContent.matchAll(sectionRegex)]) {
      const sectionName = sectionMatch[1].trim();
      const sectionContent = sectionMatch[2];
      
      const changeItemRegex = /-\s+([^\n]+)/g;
      for (const changeMatch of [...sectionContent.matchAll(changeItemRegex)]) {
        changes.push({
          type: sectionName.toLowerCase(),
          description: changeMatch[1].trim()
        });
      }
    }
    
    // If no sections were found, try to extract individual changes directly
    if (changes.length === 0) {
      const changeItemRegex = /-\s+([^\n]+)/g;
      for (const changeMatch of [...changeContent.matchAll(changeItemRegex)]) {
        changes.push({
          type: 'general',
          description: changeMatch[1].trim()
        });
      }
    }
    
    // Create changelog entry
    if (changes.length > 0) {
      try {
        // Final validation check before database insert
        if (isNaN(date.getTime())) {
          date = new Date(); // Ensure we have a valid date
        }
        
        await prisma.changelogEntry.create({
          data: {
            version,
            date,
            changes,
            projectId,
          },
        });
        
        console.log(`Created changelog entry for v${version}`);
      } catch (error) {
        console.error(`Error creating changelog entry for v${version}:`, error);
        // Try one more time with current date if it was a date-related error
        if (error.message && error.message.includes('Invalid value for argument `date`')) {
          try {
            console.log(`Retrying with current date for v${version}...`);
            await prisma.changelogEntry.create({
              data: {
                version,
                date: new Date(), // Use current date as fallback
                changes,
                projectId,
              },
            });
            console.log(`Successfully created changelog entry for v${version} with current date`);
          } catch (retryError) {
            console.error(`Failed retry for changelog entry v${version}:`, retryError);
          }
        }
      }
    }
  }
  
  console.log('Changelog conversion completed.');
}

// Archive handling function
async function convertArchivedFiles(projectId, dirPath = memoryBankDir) {
  console.log('Checking for archived files...');
  
  const archiveDir = path.join(dirPath, 'archive');
  if (!fs.existsSync(archiveDir)) {
    console.log('Archive directory not found, skipping');
    return;
  }
  
  // Get all files in the archive directory
  const files = fs.readdirSync(archiveDir);
  
  for (const file of files) {
    if (file.startsWith('edit_history_') && file.endsWith('.md')) {
      console.log(`Converting archived edit history: ${file}`);
      const content = fs.readFileSync(path.join(archiveDir, file), 'utf8');
      
      // Extract date sections
      const dateSectionRegex = /### ([A-Za-z]+ \d+, \d+)\s+([\s\S]*?)(?=\n### |$)/g;
      
      for (const dateMatch of [...content.matchAll(dateSectionRegex)]) {
        const dateStr = dateMatch[1];
        const dateContent = dateMatch[2];
        
        // Extract time sections within each date
        const timeSectionRegex = /#### ([0-9:]+)\s*-\s*(?:\[([T\d]+)\]:?)?\s*(.+?)(?=\n-|\n####|$)/g;
        
        for (const timeMatch of [...dateContent.matchAll(timeSectionRegex)]) {
          const timeStr = timeMatch[1];
          const taskId = timeMatch[2] || null;
          const description = timeMatch[3].trim();
          
          // Create timestamp
          const timestamp = extractDate(`${dateStr} ${timeStr}`) || new Date();
          
          // Extract file modifications
          const fileModRegex = /-\s+(Created|Modified|Updated|Deleted)\s+`([^`]+)`\s*-\s*(.+?)(?=\n-|\n####|$)/g;
          const modifications = [];
          
          const entrySectionContent = dateContent.substring(timeMatch.index + timeMatch[0].length);
          const nextSectionIndex = entrySectionContent.search(/\n#### /);
          const entryContent = nextSectionIndex !== -1 
            ? entrySectionContent.substring(0, nextSectionIndex) 
            : entrySectionContent;
          
          for (const modMatch of [...entryContent.matchAll(fileModRegex)]) {
            const action = modMatch[1].toUpperCase();
            const filePath = modMatch[2];
            const modDescription = modMatch[3].trim();
            
            modifications.push({
              action,
              path: filePath,
              description: modDescription,
            });
          }
          
          // Create edit history entry
          if (modifications.length > 0) {
            try {
              const entry = await prisma.editHistoryEntry.create({
                data: {
                  timestamp,
                  description,
                  taskId,
                  projectId,
                },
              });
              
              // Create file modifications
              for (const mod of modifications) {
                await prisma.fileModification.create({
                  data: {
                    path: mod.path,
                    action: mod.action,
                    description: mod.description,
                    editHistoryEntryId: entry.id,
                  },
                });
              }
              
              console.log(`Created archived edit history entry for ${dateStr} ${timeStr}`);
            } catch (error) {
              console.error(`Error creating archived edit history entry:`, error);
            }
          }
        }
      }
    } else if (file.startsWith('errorLog_') && file.endsWith('.md')) {
      console.log(`Converting archived error log: ${file}`);
      const content = fs.readFileSync(path.join(archiveDir, file), 'utf8');
      
      // Extract error entries
      const errorEntryRegex = /## ([0-9-]+ [0-9:]+)(?:\s+[A-Z]+)?(?:\s*-\s*(?:\[([T\d]+)\]:?)?\s*)?([^\n]+)\s+([\s\S]*?)(?=\n## |$)/g;
      
      for (const errorMatch of [...content.matchAll(errorEntryRegex)]) {
        const timestampStr = errorMatch[1];
        const taskId = errorMatch[2] || null;
        const title = errorMatch[3].trim();
        const errorContent = errorMatch[4];
        
        // Extract file path
        let filePath = null;
        const filePathMatch = errorContent.match(/\*\*File:\*\*\s*`([^`]+)`/);
        if (filePathMatch) {
          filePath = filePathMatch[1];
        }
        
        // Extract error message
        let errorMessage = null;
        const errorMessageMatch = errorContent.match(/\*\*Error Message:\*\*\s*```\s*([\s\S]*?)```/);
        if (errorMessageMatch) {
          errorMessage = errorMessageMatch[1].trim();
        }
        
        // Extract cause
        let cause = '';
        const causeMatch = errorContent.match(/\*\*Cause:\*\*\s*([\s\S]*?)(?=\n\*\*Fix:|$)/);
        if (causeMatch) {
          cause = causeMatch[1].trim();
        }
        
        // Extract fix
        let fix = '';
        const fixMatch = errorContent.match(/\*\*Fix:\*\*\s*([\s\S]*?)(?=\n\*\*Key Code Changes:|$)/);
        if (fixMatch) {
          fix = fixMatch[1].trim();
        }
        
        // Extract key code changes
        let keyCodeChanges = null;
        const keyCodeMatch = errorContent.match(/\*\*Key Code Changes:\*\*\s*```[a-z]*\s*([\s\S]*?)```/);
        if (keyCodeMatch) {
          keyCodeChanges = keyCodeMatch[1].trim();
        }
        
        // Extract affected files
        const affectedFiles = [];
        const affectedFilesMatch = errorContent.match(/\*\*Affected Files:\*\*\s*([\s\S]*?)(?=\n\*\*|$)/);
        if (affectedFilesMatch) {
          const affectedFilesContent = affectedFilesMatch[1];
          const fileLineRegex = /-\s+([^\n]+)/g;
          
          for (const fileMatch of [...affectedFilesContent.matchAll(fileLineRegex)]) {
            const filePath = fileMatch[1].trim();
            if (filePath.startsWith('`') && filePath.endsWith('`')) {
              affectedFiles.push(filePath.substring(1, filePath.length - 1));
            } else {
              affectedFiles.push(filePath);
            }
          }
        }
        
        // Create error entry
        try {
          const timestamp = extractDate(timestampStr) || new Date();
          
          const error = await prisma.error.create({
            data: {
              timestamp,
              title,
              filePath,
              errorDescription: cause,
              errorMessage,
              cause,
              fix,
              keyCodeChanges,
              taskId,
              projectId,
            },
          });
          
          // Create affected files
          for (const file of affectedFiles) {
            await prisma.affectedFile.create({
              data: {
                path: file,
                errorId: error.id,
              },
            });
          }
          
          console.log(`Created archived error entry: ${title}`);
        } catch (error) {
          console.error(`Error creating archived error entry:`, error);
        }
      }
    }
  }
  
  console.log('Archived files conversion completed.');
}

// Example project handling
async function convertExampleProject(projectPath) {
  console.log(`Converting example project at ${projectPath}...`);
  
  // Extract project name from path
  const projectName = path.basename(projectPath);
  
  // Check if project already exists
  let project = await prisma.project.findFirst({
    where: {
      path: projectPath
    }
  });
  
  // Create project if it doesn't exist
  if (!project) {
    project = await prisma.project.create({
      data: {
        name: projectName,
        path: projectPath
      }
    });
    console.log(`Created example project: ${projectName}`);
  }
  
  try {
    // Convert example project files using the same functions but pass the project path
    await convertTasks(project.id, projectPath);
    await convertSessionCache(project.id, projectPath);
    await convertEditHistory(project.id, projectPath);
    await convertErrorLog(project.id, projectPath);
    await convertActiveContext(project.id, projectPath);
    await convertProgress(project.id, projectPath);
    await convertProjectBrief(project.id, projectPath);
    await convertChangelog(project.id, projectPath);
    
    // Convert archived files if they exist
    await convertArchivedFiles(project.id, projectPath);
    
    console.log(`Example project ${projectName} conversion completed.`);
  } catch (error) {
    console.error(`Error converting example project ${projectName}:`, error);
  }
}

// Main function
async function main() {
  try {
    console.log('Starting database migration...');
    
    // Check if default project exists
    let project = await prisma.project.findFirst({
      where: {
        path: memoryBankDir
      }
    });
    
    // Create default project if it doesn't exist
    if (!project) {
      project = await prisma.project.create({
        data: {
          name: 'Memory Bank',
          path: memoryBankDir
        }
      });
      console.log(`Created project: ${project.name}`);
    }
    
    // Convert main project files
    await convertTasks(project.id, memoryBankDir);
    await convertSessionCache(project.id, memoryBankDir);
    await convertEditHistory(project.id, memoryBankDir);
    await convertErrorLog(project.id, memoryBankDir);
    await convertActiveContext(project.id, memoryBankDir);
    await convertProgress(project.id, memoryBankDir);
    await convertProjectBrief(project.id, memoryBankDir);
    await convertChangelog(project.id, memoryBankDir);
    
    // Convert archived files if they exist
    await convertArchivedFiles(project.id, memoryBankDir);
    
    // Check if example projects should be converted
    if (fs.existsSync(examplesDir)) {
      const examples = fs.readdirSync(examplesDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => path.join(examplesDir, dirent.name));
      
      for (const examplePath of examples) {
        await convertExampleProject(examplePath);
      }
    }
    
    console.log('Database migration completed successfully.');
  } catch (error) {
    console.error('Error during database migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main();