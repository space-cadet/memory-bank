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
    return new Date(dateString);
  } catch (error) {
    console.error(`Error parsing date: ${dateString}`, error);
    return null;
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
async function convertTasks(projectId) {}
async function convertSessionCache(projectId) {}
async function convertEditHistory(projectId) {}
async function convertErrorLog(projectId) {}
async function convertActiveContext(projectId) {}
async function convertProgress(projectId) {}
async function convertProjectBrief(projectId) {}
async function convertChangelog(projectId) {}

// Archive handling function
async function convertArchivedFiles(projectId) {}

// Example project handling
async function convertExampleProject(projectPath) {}

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
    await convertTasks(project.id);
    await convertSessionCache(project.id);
    await convertEditHistory(project.id);
    await convertErrorLog(project.id);
    await convertActiveContext(project.id);
    await convertProgress(project.id);
    await convertProjectBrief(project.id);
    await convertChangelog(project.id);
    
    // Convert archived files if they exist
    await convertArchivedFiles(project.id);
    
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