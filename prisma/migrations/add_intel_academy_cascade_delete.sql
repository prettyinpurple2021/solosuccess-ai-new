-- Add foreign key constraints with CASCADE delete for Intel Academy tables

-- Add foreign key to IntelAcademyIntegration
ALTER TABLE "IntelAcademyIntegration" 
ADD CONSTRAINT "IntelAcademyIntegration_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key to IntelAcademyCourse
ALTER TABLE "IntelAcademyCourse" 
ADD CONSTRAINT "IntelAcademyCourse_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add foreign key to IntelAcademyAchievement
ALTER TABLE "IntelAcademyAchievement" 
ADD CONSTRAINT "IntelAcademyAchievement_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
