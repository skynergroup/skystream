#!/usr/bin/env node

/**
 * Build Verification Script
 * Verifies that environment variables are properly embedded in the build output
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '..', 'dist');
const REQUIRED_VARS = {
  'G-CR3ZVV9BE1': 'Google Analytics Tracking ID',
  '20aed25855723af6f6a4dcdad0f17b86': 'TMDB API Key',
  'gtag': 'Google Analytics gtag function',
  'www.googletagmanager.com': 'Google Tag Manager script',
};

const ANALYTICS_FUNCTIONS = [
  'trackEvent',
  'trackPageView',
  'trackContentView',
  'trackMovieView',
  'trackSeriesView',
  'trackAnimeView',
  'trackVideoEvent',
  'trackPlayerPerformance',
];

console.log('🔍 Verifying build output...\n');

// Check if dist directory exists
if (!fs.existsSync(DIST_DIR)) {
  console.error('❌ Build directory not found:', DIST_DIR);
  process.exit(1);
}

// Get all files in dist directory
function getAllFiles(dir, files = []) {
  const entries = fs.readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      getAllFiles(fullPath, files);
    } else {
      files.push(fullPath);
    }
  }
  
  return files;
}

const allFiles = getAllFiles(DIST_DIR);
const jsFiles = allFiles.filter(file => file.endsWith('.js'));
const htmlFiles = allFiles.filter(file => file.endsWith('.html'));

console.log(`📁 Found ${allFiles.length} files in build output`);
console.log(`📄 HTML files: ${htmlFiles.length}`);
console.log(`🔧 JavaScript files: ${jsFiles.length}\n`);

let errors = 0;
let warnings = 0;

// Check required variables in all files
console.log('🔍 Checking for required variables...');
for (const [variable, description] of Object.entries(REQUIRED_VARS)) {
  let found = false;
  
  for (const file of allFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes(variable)) {
        console.log(`✅ ${description} found in ${path.relative(DIST_DIR, file)}`);
        found = true;
        break;
      }
    } catch (error) {
      // Skip binary files or files that can't be read as text
      continue;
    }
  }
  
  if (!found) {
    console.log(`❌ ${description} NOT found in build output`);
    errors++;
  }
}

// Check analytics functions in JavaScript files
console.log('\n📊 Checking for analytics functions...');
let analyticsFound = 0;

for (const func of ANALYTICS_FUNCTIONS) {
  let found = false;
  
  for (const file of jsFiles) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes(func)) {
        found = true;
        analyticsFound++;
        break;
      }
    } catch (error) {
      continue;
    }
  }
  
  if (found) {
    console.log(`✅ ${func} function found`);
  } else {
    console.log(`⚠️ ${func} function not found (might be minified)`);
    warnings++;
  }
}

// Check index.html specifically
console.log('\n📄 Checking index.html...');
const indexPath = path.join(DIST_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Check for Google Analytics script
  if (indexContent.includes('gtag')) {
    console.log('✅ Google Analytics gtag script found in index.html');
  } else {
    console.log('❌ Google Analytics gtag script NOT found in index.html');
    errors++;
  }
  
  // Check for tracking ID in HTML
  if (indexContent.includes('G-CR3ZVV9BE1')) {
    console.log('✅ Google Analytics tracking ID found in index.html');
  } else {
    console.log('❌ Google Analytics tracking ID NOT found in index.html');
    errors++;
  }
  
  // Check for Google Tag Manager script
  if (indexContent.includes('www.googletagmanager.com')) {
    console.log('✅ Google Tag Manager script found in index.html');
  } else {
    console.log('❌ Google Tag Manager script NOT found in index.html');
    errors++;
  }
} else {
  console.log('❌ index.html not found');
  errors++;
}

// Summary
console.log('\n📋 Build Verification Summary:');
console.log(`📁 Total files checked: ${allFiles.length}`);
console.log(`📊 Analytics functions found: ${analyticsFound}/${ANALYTICS_FUNCTIONS.length}`);
console.log(`❌ Errors: ${errors}`);
console.log(`⚠️ Warnings: ${warnings}`);

if (errors === 0) {
  console.log('\n🎉 Build verification passed! All required components found.');
  process.exit(0);
} else {
  console.log('\n💥 Build verification failed! Please check the errors above.');
  process.exit(1);
}
