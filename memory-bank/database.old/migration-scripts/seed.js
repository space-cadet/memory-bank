/**
 * Database Seed Script
 * 
 * This script creates initial test data in the database for development/testing.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Seeding database with test data...');
    
    // Create test project
    const project = await prisma.project.create({
      data: {
        name: 'Test Project',
        path: '/test/project/path'
      }
    });
    console.log(`Created test project: ${project.name}`);
    
    // Create test tasks
    const task1 = await prisma.task.create({
      data: {
        id: 'T1',
        title: 'Implement Database Migration',
        description: 'Create a database migration system to move from markdown files to structured database.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        startedAt: new Date(),
        projectId: project.id,
        completionCriteria: [
          'Create Prisma schema',
          'Implement conversion scripts',
          'Set up MCP server'
        ],
        notes: 'This is a critical task for improving efficiency.'
      }
    });
    
    const task2 = await prisma.task.create({
      data: {
        id: 'T2',
        title: 'Create API Documentation',
        description: 'Document all API endpoints and usage examples.',
        status: 'PLANNED',
        priority: 'MEDIUM',
        projectId: project.id
      }
    });
    
    console.log(`Created test tasks: ${task1.id}, ${task2.id}`);
    
    // Create task dependency
    await prisma.taskDependency.create({
      data: {
        dependingTaskId: 'T2',
        dependedTaskId: 'T1',
        relationshipType: 'BLOCKS'
      }
    });
    
    // Create test session
    const session = await prisma.session.create({
      data: {
        status: 'CONTINUING',
        notes: 'Test session for development',
        implementationFocus: 'Database migration functionality',
        projectId: project.id
      }
    });
    
    // Create session task relationship
    await prisma.sessionTask.create({
      data: {
        sessionId: session.id,
        taskId: 'T1',
        isFocus: true,
        stepProgress: [
          { step: 'Create Prisma schema', status: 'COMPLETE' },
          { step: 'Implement conversion scripts', status: 'IN_PROGRESS' },
          { step: 'Set up MCP server', status: 'PLANNED' }
        ],
        contextNotes: 'Working on conversion scripts.'
      }
    });
    
    console.log(`Created test session with SessionTask relation`);
    
    // Create test edit history entries
    const editEntry = await prisma.editHistoryEntry.create({
      data: {
        timestamp: new Date(),
        description: 'Implemented database schema',
        taskId: 'T1',
        projectId: project.id,
        modifications: {
          create: [
            {
              path: '/memory-bank/database/schema.prisma',
              action: 'CREATED',
              description: 'Created initial database schema with all required models'
            },
            {
              path: '/memory-bank/database/.env',
              action: 'CREATED',
              description: 'Added database configuration'
            }
          ]
        }
      }
    });
    
    console.log(`Created test edit history entry: ${editEntry.id}`);
    
    // Create test error entry
    const error = await prisma.error.create({
      data: {
        timestamp: new Date(),
        title: 'Database Connection Error',
        filePath: '/memory-bank/database/index.js',
        errorDescription: 'Failed to connect to the database due to incorrect connection string.',
        errorMessage: 'Error: Invalid connection string',
        cause: 'The connection string in .env file was incorrectly formatted.',
        fix: 'Updated the connection string to use the correct format.',
        keyCodeChanges: 'DATABASE_URL="file:../memory-bank.db" -> DATABASE_URL="file:../db/memory-bank.db"',
        taskId: 'T1',
        projectId: project.id,
        affectedFiles: {
          create: [
            { path: '/memory-bank/database/.env' },
            { path: '/memory-bank/database/index.js' }
          ]
        }
      }
    });
    
    console.log(`Created test error entry: ${error.id}`);
    
    // Create test active context
    const activeContext = await prisma.activeContext.create({
      data: {
        implementationFocus: 'Database migration and conversion scripts',
        currentDecisions: [
          'Using SQLite for initial development',
          'Implementing Prisma ORM for database access',
          'Creating MCP server for API access'
        ],
        nextActions: [
          'Complete conversion scripts',
          'Test database migration',
          'Set up MCP server endpoints'
        ],
        projectId: project.id
      }
    });
    
    console.log(`Created test active context: ${activeContext.id}`);
    
    // Create test progress entry
    const progress = await prisma.progress.create({
      data: {
        milestones: [
          { description: 'Database schema defined', completed: true },
          { description: 'Conversion scripts implemented', completed: false },
          { description: 'MCP server deployed', completed: false }
        ],
        knownIssues: [
          'Need to handle archived files better',
          'Performance optimization needed for large files'
        ],
        goals: [
          'Complete database migration by April 20',
          'Reduce token usage by 50%'
        ],
        projectId: project.id
      }
    });
    
    console.log(`Created test progress entry: ${progress.id}`);
    
    // Create test project brief
    const projectBrief = await prisma.projectBrief.create({
      data: {
        overview: 'Test project for database migration and MCP server implementation.',
        objectives: [
          { title: 'Efficient Data Storage', details: 'Store memory bank data in structured database.' },
          { title: 'Reduced Token Usage', details: 'Minimize token usage with targeted API endpoints.' }
        ],
        keyFiles: [
          { path: '/memory-bank/database/schema.prisma', description: 'Database schema definition' },
          { path: '/memory-bank/database/migration-scripts/convert.js', description: 'Conversion script' }
        ],
        architecture: 'Using Prisma ORM with SQLite, with option to migrate to PostgreSQL later.',
        technologies: [
          'Prisma ORM',
          'SQLite',
          'Node.js',
          'Express'
        ],
        projectId: project.id
      }
    });
    
    console.log(`Created test project brief: ${projectBrief.id}`);
    
    // Create test changelog entry
    const changelog = await prisma.changelogEntry.create({
      data: {
        version: '1.0.0',
        date: new Date(),
        changes: [
          { type: 'added', description: 'Initial database schema' },
          { type: 'added', description: 'Conversion scripts for markdown files' },
          { type: 'fixed', description: 'Database connection issues' }
        ],
        projectId: project.id
      }
    });
    
    console.log(`Created test changelog entry: ${changelog.id}`);
    
    console.log('Database seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the main function
main();
