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

// Utility to extract date from markdown string
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

// Parse task status emoji
function parseTaskStatus(statusText) {
  if (!statusText) return 'PLANNED';
  
  if (statusText.includes('✅') || statusText.toLowerCase().includes('done') || statusText.toLowerCase().includes('complete')) {
    return 'DONE';
  } else if (statusText.includes('🔄') || statusText.toLowerCase().includes('in progress')) {
    return 'IN_PROGRESS';
  } else {
    return 'PLANNED';
  }
}

// Convert tasks.md to database entries
async function convertTasks() {
  console.log('Converting tasks.md...');
  
  const tasksPath = path.join(memoryBankDir, 'tasks.md');
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