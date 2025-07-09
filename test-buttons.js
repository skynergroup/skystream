// Test script to verify button functionality
// This script can be run in the browser console to test the buttons

console.log('Testing SkyStream Content Detail Buttons...');

// Test Share functionality
function testShare() {
  console.log('Testing Share button...');
  try {
    // Simulate share button click
    const shareBtn = document.querySelector('button[aria-label*="Share"], button:has(svg):contains("Share")');
    if (shareBtn) {
      shareBtn.click();
      console.log('✅ Share button clicked successfully');
    } else {
      console.log('❌ Share button not found');
    }
  } catch (error) {
    console.log('❌ Share test failed:', error);
  }
}

// Test Save functionality
function testSave() {
  console.log('Testing Save button...');
  try {
    // Check localStorage before
    const beforeFavorites = JSON.parse(localStorage.getItem('skystream_favorites') || '[]');
    console.log('Favorites before:', beforeFavorites.length);
    
    // Simulate save button click
    const saveBtn = document.querySelector('button:has(svg):contains("Save")');
    if (saveBtn) {
      saveBtn.click();
      console.log('✅ Save button clicked successfully');
      
      // Check localStorage after
      const afterFavorites = JSON.parse(localStorage.getItem('skystream_favorites') || '[]');
      console.log('Favorites after:', afterFavorites.length);
    } else {
      console.log('❌ Save button not found');
    }
  } catch (error) {
    console.log('❌ Save test failed:', error);
  }
}

// Test Party functionality
function testParty() {
  console.log('Testing Party button...');
  try {
    const partyBtn = document.querySelector('button:has(svg):contains("Party")');
    if (partyBtn) {
      console.log('✅ Party button found');
      // Note: Party button redirects to parties page, so we won't click it in test
      console.log('Party button would redirect to:', `/parties?content=${window.location.pathname}`);
    } else {
      console.log('❌ Party button not found');
    }
  } catch (error) {
    console.log('❌ Party test failed:', error);
  }
}

// Test Download functionality
function testDownload() {
  console.log('Testing Download button...');
  try {
    const downloadBtn = document.querySelector('button:has(svg):contains("Download")');
    if (downloadBtn) {
      console.log('✅ Download button found');
      // Note: Download button opens new window, so we won't click it in test
      console.log('Download button would open download URL');
    } else {
      console.log('❌ Download button not found');
    }
  } catch (error) {
    console.log('❌ Download test failed:', error);
  }
}

// Run all tests
function runAllTests() {
  console.log('🚀 Starting button functionality tests...');
  testShare();
  testSave();
  testParty();
  testDownload();
  console.log('✅ All tests completed!');
}

// Export for use
window.testButtons = {
  testShare,
  testSave,
  testParty,
  testDownload,
  runAllTests
};

console.log('Test functions loaded. Run window.testButtons.runAllTests() to test all buttons.');
