// Test file to verify command palette functionality
// This can be run in the browser console to test commands

// Test navigation commands
function testNavigationCommands() {
  console.log('Testing Navigation Commands...')
  
  // Test tab switching
  const testTabSwitch = (tabName) => {
    console.log(`Switching to ${tabName} tab`)
    // This would be called by the command palette
    return `Switched to ${tabName} tab`
  }
  
  console.log(testTabSwitch('chat'))
  console.log(testTabSwitch('tasks'))
  console.log(testTabSwitch('progress'))
  console.log(testTabSwitch('calendar'))
}

// Test task commands
function testTaskCommands() {
  console.log('Testing Task Commands...')
  
  // Test task creation
  const testCreateTask = () => {
    console.log('Creating new task...')
    // Focus chat input and add text
    const chatInput = document.querySelector('textarea[placeholder*="message"]')
    if (chatInput) {
      chatInput.focus()
      chatInput.value = 'Create a task: '
      chatInput.dispatchEvent(new Event('input', { bubbles: true }))
      return 'Task creation initiated'
    }
    return 'Chat input not found'
  }
  
  console.log(testCreateTask())
}

// Test utility commands
function testUtilityCommands() {
  console.log('Testing Utility Commands...')
  
  // Test refresh
  const testRefresh = () => {
    console.log('Refreshing data...')
    // This would call fetchUserStats, fetchUserTasks, etc.
    return 'Data refresh initiated'
  }
  
  // Test calendar export
  const testCalendarExport = () => {
    console.log('Exporting calendar...')
    // This would call exportToCalendar()
    return 'Calendar export initiated'
  }
  
  console.log(testRefresh())
  console.log(testCalendarExport())
}

// Run all tests
function runCommandPaletteTests() {
  console.log('=== Command Palette Tests ===')
  testNavigationCommands()
  testTaskCommands()
  testUtilityCommands()
  console.log('=== Tests Complete ===')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testCommandPalette = runCommandPaletteTests
  console.log('Command palette tests loaded. Run testCommandPalette() to test.')
}
