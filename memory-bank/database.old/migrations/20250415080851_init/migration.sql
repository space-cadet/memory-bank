-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "lastActiveAt" DATETIME,
    "pausedAt" DATETIME,
    "pausedReason" TEXT,
    "owner" TEXT,
    "completionCriteria" JSONB,
    "notes" TEXT,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Task_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TaskDependency" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dependingTaskId" TEXT NOT NULL,
    "dependedTaskId" TEXT NOT NULL,
    "relationshipType" TEXT,
    CONSTRAINT "TaskDependency_dependingTaskId_fkey" FOREIGN KEY ("dependingTaskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskDependency_dependedTaskId_fkey" FOREIGN KEY ("dependedTaskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RelatedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "isPlanned" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "RelatedFile_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "status" TEXT NOT NULL,
    "notes" TEXT,
    "implementationFocus" TEXT,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Session_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "isFocus" BOOLEAN NOT NULL DEFAULT false,
    "stepProgress" JSONB,
    "contextNotes" TEXT,
    CONSTRAINT "SessionTask_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SessionTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EditHistoryEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "taskId" TEXT,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "EditHistoryEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EditHistoryEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FileModification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "editHistoryEntryId" TEXT NOT NULL,
    CONSTRAINT "FileModification_editHistoryEntryId_fkey" FOREIGN KEY ("editHistoryEntryId") REFERENCES "EditHistoryEntry" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Error" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "filePath" TEXT,
    "errorDescription" TEXT NOT NULL,
    "errorMessage" TEXT,
    "cause" TEXT NOT NULL,
    "fix" TEXT NOT NULL,
    "keyCodeChanges" TEXT,
    "taskId" TEXT,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Error_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Error_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AffectedFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "path" TEXT NOT NULL,
    "errorId" TEXT NOT NULL,
    CONSTRAINT "AffectedFile_errorId_fkey" FOREIGN KEY ("errorId") REFERENCES "Error" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ActiveContext" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "implementationFocus" TEXT NOT NULL,
    "currentDecisions" JSONB,
    "nextActions" JSONB,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ActiveContext_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "milestones" JSONB,
    "knownIssues" JSONB,
    "goals" JSONB,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Progress_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectBrief" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "updatedAt" DATETIME NOT NULL,
    "overview" TEXT NOT NULL,
    "objectives" JSONB,
    "keyFiles" JSONB,
    "architecture" TEXT,
    "technologies" JSONB,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ProjectBrief_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChangelogEntry" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "version" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "changes" JSONB NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "ChangelogEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomDocument" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT,
    "updatedAt" DATETIME NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "CustomDocument_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_path_key" ON "Project"("path");

-- CreateIndex
CREATE UNIQUE INDEX "TaskDependency_dependingTaskId_dependedTaskId_key" ON "TaskDependency"("dependingTaskId", "dependedTaskId");

-- CreateIndex
CREATE UNIQUE INDEX "RelatedFile_taskId_path_key" ON "RelatedFile"("taskId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "SessionTask_sessionId_taskId_key" ON "SessionTask"("sessionId", "taskId");

-- CreateIndex
CREATE UNIQUE INDEX "AffectedFile_errorId_path_key" ON "AffectedFile"("errorId", "path");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDocument_projectId_path_key" ON "CustomDocument"("projectId", "path");
