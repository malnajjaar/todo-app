import React, { useState, useEffect } from 'react';

// Complete TodoApp Component with all requested features
const TodoAppComplete = () => {
  // Today's date for display and date calculations
  const today = new Date();
  const formattedDate = today.toDateString();
  
  // For date comparisons
  const todayISO = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowISO = tomorrow.toISOString().split('T')[0];
  
  // Task statuses
  const STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PENDING_FOLLOWUP: 'pending_followup'
  };
  
  // Demo states
  const [tasks, setTasks] = useState([
    { 
      id: '1', 
      title: 'Grocery shopping', 
      status: STATUS.ACTIVE, 
      date: 'today', 
      followupWith: '', 
      isImportant: true,
      hasChecklist: true,
      checklist: [
        { id: 'c1', text: 'Milk', completed: true },
        { id: 'c2', text: 'Eggs', completed: false },
        { id: 'c3', text: 'Bread', completed: false },
        { id: 'c4', text: 'Apples', completed: true }
      ],
      isExpanded: false,
      timeSpent: 0, // in minutes
      completionDate: null
    },
    { 
      id: '2', 
      title: 'Prepare presentation', 
      status: STATUS.ACTIVE, 
      date: 'today', 
      followupWith: '', 
      isImportant: false,
      hasChecklist: false,
      checklist: [],
      isExpanded: false,
      timeSpent: 0,
      completionDate: null
    },
    { 
      id: '3', 
      title: 'Call doctor for appointment', 
      status: STATUS.PENDING_FOLLOWUP, 
      date: 'today', 
      followupWith: 'Clinic reception', 
      isImportant: true,
      hasChecklist: false,
      checklist: [],
      isExpanded: false,
      timeSpent: 0,
      completionDate: null
    },
    { 
      id: '4', 
      title: 'Team weekly meeting', 
      status: STATUS.ACTIVE, 
      date: 'tomorrow', 
      followupWith: '', 
      isImportant: false,
      hasChecklist: false,
      checklist: [],
      isExpanded: false,
      timeSpent: 0,
      completionDate: null
    },
    { 
      id: '5', 
      title: 'Dentist appointment', 
      status: STATUS.ACTIVE, 
      date: '2025-05-05', // Very soon scheduled task (should appear in "Tomorrow")
      followupWith: '', 
      isImportant: true,
      hasChecklist: false,
      checklist: [],
      isExpanded: false,
      timeSpent: 0,
      completionDate: null
    },
    { 
      id: '6', 
      title: 'Annual car maintenance', 
      status: STATUS.ACTIVE, 
      date: '2025-05-20', // Scheduled for a specific date
      followupWith: '', 
      isImportant: false,
      hasChecklist: false,
      checklist: [],
      isExpanded: false,
      timeSpent: 0,
      completionDate: null
    },
    { 
      id: '7', 
      title: 'Complete quarterly report', 
      status: STATUS.COMPLETED, 
      date: 'today', 
      followupWith: '', 
      isImportant: true,
      hasChecklist: false,
      checklist: [],
      isExpanded: false,
      timeSpent: 120, // 2 hours
      completionDate: todayISO
    },
    { 
      id: '8', 
      title: 'Review project timeline', 
      status: STATUS.COMPLETED, 
      date: 'today', 
      followupWith: '', 
      isImportant: false,
      hasChecklist: false,
      checklist: [],
      isExpanded: false,
      timeSpent: 45, // 45 minutes
      completionDate: todayISO
    }
  ]);
  
  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskImportant, setNewTaskImportant] = useState(false);
  const [newTaskDate, setNewTaskDate] = useState('today');
  const [currentTab, setCurrentTab] = useState('today');
  const [dayLabel, setDayLabel] = useState('Today');
  const [followupWith, setFollowupWith] = useState('');
  const [isAddingFollowup, setIsAddingFollowup] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [isChangingDate, setIsChangingDate] = useState(false);
  const [taskToChangeDate, setTaskToChangeDate] = useState(null);
  const [newDate, setNewDate] = useState('');
  const [customDateInput, setCustomDateInput] = useState('');
  const [isAddingTime, setIsAddingTime] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [historyDate, setHistoryDate] = useState(todayISO);
  
  // Helper functions
  const formatDateForDisplay = (dateString) => {
    if (dateString === 'today') return 'Today';
    if (dateString === 'tomorrow') return 'Tomorrow';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const formatTimeSpent = (minutes) => {
    if (minutes === 0) return '0 min';
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${remainingMinutes} min`;
    }
  };
  
  const getActualDate = (dateString) => {
    if (dateString === 'today') return todayISO;
    if (dateString === 'tomorrow') return tomorrowISO;
    return dateString;
  };
  
  // Actions
  const toggleTaskStatus = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        // For tasks without checklists
        if (!task.hasChecklist) {
          // If marking as completed, open time input modal
          if (task.status === STATUS.ACTIVE) {
            setSelectedTaskId(id);
            setTimeSpent(task.timeSpent || 0);
            setIsAddingTime(true);
            return task; // Don't change status yet
          }
          
          // If marking as active again
          return { 
            ...task, 
            status: STATUS.ACTIVE,
            completionDate: null
          };
        }
        
        // For tasks with checklists
        const allCompleted = task.checklist.length > 0 && 
                            task.checklist.every(item => item.completed);
        
        // Toggle based on checklist status
        let newStatus;
        let newCompletionDate = task.completionDate;
        
        if (task.status === STATUS.ACTIVE && allCompleted) {
          // If all items are checked, open time input
          setSelectedTaskId(id);
          setTimeSpent(task.timeSpent || 0);
          setIsAddingTime(true);
          return task; // Don't change status yet
        } else if (task.status === STATUS.COMPLETED) {
          newStatus = STATUS.ACTIVE;
          newCompletionDate = null;
        } else {
          newStatus = task.status; // No change
        }
        
        return { 
          ...task, 
          status: newStatus,
          completionDate: newCompletionDate
        };
      }
      return task;
    }));
  };
  
  const saveCompletionTime = () => {
    setTasks(tasks.map(task => {
      if (task.id === selectedTaskId) {
        return {
          ...task,
          status: STATUS.COMPLETED,
          timeSpent: timeSpent,
          completionDate: todayISO
        };
      }
      return task;
    }));
    
    setIsAddingTime(false);
    setSelectedTaskId(null);
    setTimeSpent(0);
  };
  
  const toggleImportant = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return { ...task, isImportant: !task.isImportant };
      }
      return task;
    }));
  };
  
  const toggleExpanded = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return { ...task, isExpanded: !task.isExpanded };
      }
      return task;
    }));
  };
  
  const createChecklist = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        return { 
          ...task, 
          hasChecklist: true, 
          isExpanded: true 
        };
      }
      return task;
    }));
  };
  
  const openChangeDateModal = (id) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setTaskToChangeDate(task);
      setNewDate(task.date === 'today' || task.date === 'tomorrow' ? task.date : 'custom');
      setCustomDateInput(task.date !== 'today' && task.date !== 'tomorrow' ? task.date : '');
      setIsChangingDate(true);
    }
  };
  
  const saveNewDate = () => {
    if (!taskToChangeDate) return;
    
    // Convert the date to the appropriate format
    let dateToSave = newDate;
    if (newDate === 'custom' && customDateInput) {
      dateToSave = customDateInput;
    }
    
    setTasks(tasks.map(task => {
      if (task.id === taskToChangeDate.id) {
        return { ...task, date: dateToSave };
      }
      return task;
    }));
    
    setIsChangingDate(false);
    setTaskToChangeDate(null);
    setNewDate('');
    setCustomDateInput('');
  };
  
  const toggleChecklistItem = (taskId, itemId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedChecklist = task.checklist.map(item => {
          if (item.id === itemId) {
            return { ...item, completed: !item.completed };
          }
          return item;
        });
        
        // Check if all items are completed
        const allCompleted = updatedChecklist.every(item => item.completed);
        
        // If all completed, we'll handle the completion time in toggleTaskStatus
        
        return { 
          ...task, 
          checklist: updatedChecklist
        };
      }
      return task;
    }));
  };
  
  const addChecklistItem = (taskId) => {
    if (!newChecklistItem.trim()) return;
    
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const newItem = {
          id: `c${Date.now()}`,
          text: newChecklistItem.trim(),
          completed: false
        };
        
        return {
          ...task,
          hasChecklist: true,
          checklist: [...task.checklist, newItem]
        };
      }
      return task;
    }));
    
    setNewChecklistItem('');
  };
  
  const deleteChecklistItem = (taskId, itemId) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const updatedChecklist = task.checklist.filter(item => item.id !== itemId);
        return {
          ...task,
          checklist: updatedChecklist,
          hasChecklist: updatedChecklist.length > 0
        };
      }
      return task;
    }));
  };
  
  const markAsPendingFollowup = (id) => {
    setSelectedTaskId(id);
    setFollowupWith('');
    setIsAddingFollowup(true);
  };
  
  const saveFollowup = () => {
    setTasks(tasks.map(task => {
      if (task.id === selectedTaskId) {
        return { 
          ...task, 
          status: STATUS.PENDING_FOLLOWUP,
          followupWith: followupWith
        };
      }
      return task;
    }));
    setIsAddingFollowup(false);
    setSelectedTaskId(null);
    setFollowupWith('');
  };
  
  const cancelFollowup = () => {
    setIsAddingFollowup(false);
    setSelectedTaskId(null);
    setFollowupWith('');
  };
  
  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };
  
  const addTask = () => {
    if (newTaskText.trim()) {
      // Determine the date to use
      let finalDate = newTaskDate;
      if (newTaskDate === 'custom' && customDateInput) {
        finalDate = customDateInput;
      }
      
      const newTask = {
        id: Date.now().toString(),
        title: newTaskText,
        status: STATUS.ACTIVE,
        date: finalDate,
        followupWith: '',
        isImportant: newTaskImportant,
        hasChecklist: false,
        checklist: [],
        isExpanded: false,
        timeSpent: 0,
        completionDate: null
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
      setNewTaskImportant(false);
    }
  };
  
  const moveToTomorrow = () => {
    setTasks(tasks.map(task => {
      // If task is for today and not fully completed, move to tomorrow
      if (task.date === 'today' && task.status !== STATUS.COMPLETED) {
        return { ...task, date: 'tomorrow' };
      }
      return task;
    }));
    
    // Auto-switch to tomorrow tab
    setCurrentTab('tomorrow');
    setDayLabel('Tomorrow');
  };
  
  const switchTab = (tab, label) => {
    setCurrentTab(tab);
    setDayLabel(label);
  };
  
  // Filter tasks based on current tab with auto-migration of scheduled tasks
  const filteredTasks = tasks.filter(task => {
    if (currentTab === 'today') {
      // Include today tasks and scheduled tasks for today
      return task.date === 'today' || getActualDate(task.date) === todayISO;
    }
    if (currentTab === 'tomorrow') {
      // Include tomorrow tasks and scheduled tasks for tomorrow
      return task.date === 'tomorrow' || getActualDate(task.date) === tomorrowISO;
    }
    if (currentTab === 'scheduled') {
      // Only include truly scheduled tasks (not today or tomorrow)
      const actualDate = getActualDate(task.date);
      return (
        task.date !== 'today' && 
        task.date !== 'tomorrow' && 
        actualDate !== todayISO && 
        actualDate !== tomorrowISO
      );
    }
    if (currentTab === 'history') {
      // Show completed tasks for the selected history date
      return task.status === STATUS.COMPLETED && task.completionDate === historyDate;
    }
    return false;
  });
  
  // All scheduled tasks (regardless of date)
  const scheduledTasks = tasks.filter(task => {
    return task.date !== 'today' && task.date !== 'tomorrow';
  });
  
  // For scheduled tasks, group them by date
  const scheduledTasksByDate = {};
  if (currentTab === 'scheduled') {
    filteredTasks.forEach(task => {
      if (!scheduledTasksByDate[task.date]) {
        scheduledTasksByDate[task.date] = [];
      }
      scheduledTasksByDate[task.date].push(task);
    });
  }
  
  // Sort dates for scheduled tasks
  const sortedDates = Object.keys(scheduledTasksByDate).sort();
  
  // Get all available history dates (completion dates)
  const allHistoryDates = [...new Set(
    tasks
      .filter(task => task.status === STATUS.COMPLETED && task.completionDate)
      .map(task => task.completionDate)
  )].sort();
  
  // Stats for current tab
  const completedCount = filteredTasks.filter(task => task.status === STATUS.COMPLETED).length;
  const pendingCount = filteredTasks.filter(task => task.status === STATUS.PENDING_FOLLOWUP).length;
  const importantCount = filteredTasks.filter(task => task.isImportant).length;
  const scheduledCount = scheduledTasks.length;
  
  // Total time spent for history view
  const totalTimeSpent = currentTab === 'history' 
    ? filteredTasks.reduce((total, task) => total + (task.timeSpent || 0), 0)
    : 0;
  
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white p-4 shadow">
        <h1 className="text-2xl font-bold text-gray-800">Daily Tasks</h1>
        <p className="text-gray-600">{formattedDate}</p>
        
        {/* Tab Navigation */}
        <div className="flex mt-4 border-b overflow-x-auto">
          <button 
            className={`px-4 py-2 font-medium ${currentTab === 'today' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => switchTab('today', 'Today')}
          >
            Today
          </button>
          <button 
            className={`px-4 py-2 font-medium ${currentTab === 'tomorrow' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => switchTab('tomorrow', 'Tomorrow')}
          >
            Tomorrow
          </button>
          <button 
            className={`px-4 py-2 font-medium ${currentTab === 'scheduled' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => switchTab('scheduled', 'Scheduled')}
          >
            Scheduled ({scheduledCount})
          </button>
          <button 
            className={`px-4 py-2 font-medium ${currentTab === 'history' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'}`}
            onClick={() => switchTab('history', 'History')}
          >
            History
          </button>
        </div>
      </div>
      
      {/* Task Stats */}
      <div className="p-4 bg-blue-50 flex justify-between items-center shadow-sm">
        {currentTab !== 'history' ? (
          <>
            <span className="text-gray-700">
              {completedCount}/{filteredTasks.length} completed
              {pendingCount > 0 && ` • ${pendingCount} pending follow-up`}
              {importantCount > 0 && ` • ${importantCount} important`}
            </span>
            
            {currentTab === 'today' && (
              <button 
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-800 px-3 py-1 rounded-md shadow text-sm font-medium"
                onClick={moveToTomorrow}
              >
                Move unfinished to tomorrow
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center">
              <span className="mr-2">Date:</span>
              <select 
                className="border border-gray-300 rounded p-1 bg-white"
                value={historyDate}
                onChange={(e) => setHistoryDate(e.target.value)}
              >
                {allHistoryDates.map(date => (
                  <option key={date} value={date}>
                    {formatDateForDisplay(date)}
                  </option>
                ))}
              </select>
            </div>
            <span className="text-gray-700">
              {filteredTasks.length} tasks • Total time: {formatTimeSpent(totalTimeSpent)}
            </span>
          </>
        )}
      </div>
      
      {/* Task List */}
      <div className="flex-1 overflow-auto">
        {isAddingFollowup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-lg shadow-lg w-4/5 max-w-md">
              <h3 className="text-lg font-medium mb-3">Add Follow-up Details</h3>
              <input
                type="text"
                className="w-full border border-gray-300 p-2 rounded-md mb-4"
                placeholder="Who are you waiting on? (e.g. 'John from Marketing')"
                value={followupWith}
                onChange={(e) => setFollowupWith(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-md text-gray-700"
                  onClick={cancelFollowup}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  onClick={saveFollowup}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isChangingDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-lg shadow-lg w-4/5 max-w-md">
              <h3 className="text-lg font-medium mb-3">Change Task Date</h3>
              
              <div className="mb-4">
                <div className="flex space-x-2 mb-3">
                  <button 
                    className={`px-3 py-1 rounded ${newDate === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setNewDate('today')}
                  >
                    Today
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ${newDate === 'tomorrow' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setNewDate('tomorrow')}
                  >
                    Tomorrow
                  </button>
                  <button 
                    className={`px-3 py-1 rounded ${newDate === 'custom' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setNewDate('custom')}
                  >
                    Custom
                  </button>
                </div>
                
                {newDate === 'custom' && (
                  <div>
                    <div className="mb-2 text-sm text-gray-700">Pick a date:</div>
                    <input
                      type="date"
                      className="w-full border border-gray-300 p-2 rounded-md"
                      value={customDateInput}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setCustomDateInput(e.target.value)}
                    />
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-md text-gray-700"
                  onClick={() => {
                    setIsChangingDate(false);
                    setTaskToChangeDate(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  onClick={saveNewDate}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
        
        {isAddingTime && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
            <div className="bg-white p-4 rounded-lg shadow-lg w-4/5 max-w-md">
              <h3 className="text-lg font-medium mb-3">Time Spent</h3>
              
              <div className="mb-4">
                <label className="block text-sm text-gray-700 mb-2">
                  How much time did this task take? (minutes)
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 p-2 rounded-md"
                  min="0"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
                />
                
                <div className="mt-2 text-sm text-gray-500">
                  {formatTimeSpent(timeSpent)}
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button 
                  className="px-4 py-2 bg-gray-200 rounded-md text-gray-700"
                  onClick={() => {
                    setIsAddingTime(false);
                    setSelectedTaskId(null);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md"
                  onClick={saveCompletionTime}
                >
                  Complete Task
                </button>
              </div>
            </div>
          </div>
        )}
      
        <div className="bg-white my-2 mx-2 rounded-md shadow">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {currentTab === 'history' 
                ? `No completed tasks on ${formatDateForDisplay(historyDate)}.`
                : `No tasks for ${dayLabel.toLowerCase()}! Add one below.`}
            </div>
          ) : (
            <ul className="divide-y">
              {currentTab !== 'scheduled' ? (
                // Regular task list for Today, Tomorrow, and History
                filteredTasks.map(task => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    isHistory={currentTab === 'history'}
                    onToggleStatus={toggleTaskStatus}
                    onToggleImportant={toggleImportant}
                    onToggleExpanded={toggleExpanded}
                    onCreateChecklist={createChecklist}
                    onChangeDate={openChangeDateModal}
                    onMarkPendingFollowup={markAsPendingFollowup}
                    onDelete={deleteTask}
                    onAddChecklistItem={addChecklistItem}
                    onToggleChecklistItem={toggleChecklistItem}
                    onDeleteChecklistItem={deleteChecklistItem}
                    newChecklistItem={newChecklistItem}
                    setNewChecklistItem={setNewChecklistItem}
                  />
                ))
              ) : (
                // Grouped by date for Scheduled tasks
                sortedDates.map(date => (
                  <li key={date} className="bg-gray-50">
                    <div className="bg-gray-100 p-2 font-medium text-gray-700">
                      {formatDateForDisplay(date)}
                    </div>
                    <ul className="divide-y">
                      {scheduledTasksByDate[date].map(task => (
                        <TaskItem 
                          key={task.id}
                          task={task}
                          isHistory={false}
                          onToggleStatus={toggleTaskStatus}
                          onToggleImportant={toggleImportant}
                          onToggleExpanded={toggleExpanded}
                          onCreateChecklist={createChecklist}
                          onChangeDate={openChangeDateModal}
                          onMarkPendingFollowup={markAsPendingFollowup}
                          onDelete={deleteTask}
                          onAddChecklistItem={addChecklistItem}
                          onToggleChecklistItem={toggleChecklistItem}
                          onDeleteChecklistItem={deleteChecklistItem}
                          newChecklistItem={newChecklistItem}
                          setNewChecklistItem={setNewChecklistItem}
                        />
                      ))}
                    </ul>
                  </li>
                ))
              )}
            </ul>
          )}
        </div>
      </div>
      
      {/* Add Task Form - Hide in History view */}
      {currentTab !== 'history' && (
        <div className="bg-white p-4 shadow-inner border-t">
          <div className="flex items-center mb-3 space-x-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="important-checkbox"
                checked={newTaskImportant}
                onChange={() => setNewTaskImportant(!newTaskImportant)}
                className="mr-2"
              />
              <label htmlFor="important-checkbox" className="text-sm text-gray-700">
                Important
              </label>
            </div>
            
            <div className="flex-1">
              <select 
                className="w-full p-1 border border-gray-300 rounded text-sm"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
              >
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="custom">Custom date...</option>
              </select>
            </div>
            
            {newTaskDate === 'custom' && (
              <div className="flex-1">
                <input 
                  type="date" 
                  className="w-full p-1 border border-gray-300 rounded text-sm"
                  value={customDateInput}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCustomDateInput(e.target.value)}
                />
              </div>
            )}
          </div>
          
          <div className="flex">
            <input
              type="text"
              className="flex-1 border border-gray-300 p-2 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add a new task..."
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
            />
            <button
              className={`px-4 py-2 rounded-r-md font-medium ${newTaskText.trim() ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-500'}`}
              onClick={addTask}
              disabled={!newTaskText.trim()}
            >
              Add
            </button>
          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="bg-gray-100 p-2 border-t">
        <div className="flex justify-center space-x-4 text-sm flex-wrap">
          <div className="flex items-center m-1">
            <div className="w-3 h-3 rounded-full border-2 border-blue-500 mr-1"></div>
            <span className="text-gray-600">Active</span>
          </div>
          <div className="flex items-center m-1">
            <div className="w-3 h-3 rounded-full bg-green-500 border-2 border-green-500 mr-1"></div>
            <span className="text-gray-600">Completed</span>
          </div>
          <div className="flex items-center m-1">
            <div className="w-3 h-3 rounded-full bg-yellow-500 border-2 border-yellow-500 mr-1"></div>
            <span className="text-gray-600">Pending Follow-up</span>
          </div>
          <div className="flex items-center m-1 text-red-500">
            <span className="mr-1">★</span>
            <span className="text-gray-600">Important</span>
          </div>
          <div className="flex items-center m-1 text-gray-500">
            <span className="mr-1 text-sm">+ □</span>
            <span className="text-gray-600">Add Checklist</span>
          </div>
        </div>
      </div>
      
      {/* Help text */}
      <div className="bg-gray-100 p-2 text-xs text-gray-500 text-center">
        <p>Demo: Try adding tasks, completing them, and checking the history tab</p>
      </div>
    </div>
  );
};

// Task Item Component
const TaskItem = ({ 
  task, 
  isHistory,
  onToggleStatus, 
  onToggleImportant, 
  onToggleExpanded, 
  onCreateChecklist,
  onChangeDate,
  onMarkPendingFollowup, 
  onDelete, 
  onAddChecklistItem,
  onToggleChecklistItem, 
  onDeleteChecklistItem,
  newChecklistItem,
  setNewChecklistItem
}) => {
  const STATUS = {
    ACTIVE: 'active',
    COMPLETED: 'completed',
    PENDING_FOLLOWUP: 'pending_followup'
  };

  const formatTimeSpent = (minutes) => {
    if (minutes === 0) return null;
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${remainingMinutes} min`;
    }
  };

  return (
    <li className={`${task.isImportant ? 'bg-red-50' : ''}`}>
      <div className="p-4">
        {/* Task Header */}
        <div className="flex items-center">
          {/* Status indicator */}
          <button 
            className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center 
              ${task.status === STATUS.COMPLETED ? 'bg-green-500 border-green-500' : 
                task.status === STATUS.PENDING_FOLLOWUP ? 'bg-yellow-500 border-yellow-500' : 'border-blue-500'}`}
            onClick={() => !isHistory && onToggleStatus(task.id)}
            disabled={isHistory}
          >
            {task.status === STATUS.COMPLETED && (
              <span className="text-white text-xs">✓</span>
            )}
            {task.status === STATUS.PENDING_FOLLOWUP && (
              <span className="text-white text-xs">⋯</span>
            )}
          </button>
          
          {/* Priority indicator */}
          {!isHistory && (
            <button 
              className={`w-6 h-6 flex items-center justify-center mr-3 text-lg
                ${task.isImportant ? 'text-red-500' : 'text-gray-300'}`}
              onClick={() => onToggleImportant(task.id)}
              title={task.isImportant ? "Remove importance" : "Mark as important"}
            >
              ★
            </button>
          )}
          
          {/* Time spent (in history view) or Checklist button */}
          {isHistory ? (
            <div className="text-sm text-gray-500 mr-3">
              {formatTimeSpent(task.timeSpent) || "No time recorded"}
            </div>
          ) : task.hasChecklist ? (
            <button 
              className="w-6 h-6 flex items-center justify-center mr-3 text-sm text-blue-500"
              onClick={() => onToggleExpanded(task.id)}
              title={task.isExpanded ? "Collapse checklist" : "Expand checklist"}
            >
              <span className="transform transition-transform duration-200" style={{ 
                transform: task.isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
              }}>
                ▶
              </span>
            </button>
          ) : (
            <button 
              className="w-6 h-6 flex items-center justify-center mr-3 text-sm text-gray-400 hover:text-blue-500"
              onClick={() => onCreateChecklist(task.id)}
              title="Add checklist"
            >
              <span className="text-xs">+ □</span>
            </button>
          )}
          
          <span className={`flex-1 
            ${task.status === STATUS.COMPLETED ? 'line-through text-gray-400' : 
              task.status === STATUS.PENDING_FOLLOWUP ? 'text-yellow-700' : 'text-gray-800'}`}>
            {task.title}
            {task.hasChecklist && task.checklist.length > 0 && (
              <span className="ml-2 text-xs text-gray-500">
                ({task.checklist.filter(item => item.completed).length}/{task.checklist.length})
              </span>
            )}
          </span>
          
          {!isHistory && (
            <div className="flex space-x-1">
              {/* Calendar button to change date */}
              <button 
                className="text-blue-600 hover:text-blue-800 px-2 py-1 text-sm"
                onClick={() => onChangeDate(task.id)}
                title="Change date"
              >
                📅
              </button>
              
              {task.status !== STATUS.PENDING_FOLLOWUP && (
                <button 
                  className="text-yellow-600 hover:text-yellow-800 px-2 py-1 text-sm"
                  onClick={() => onMarkPendingFollowup(task.id)}
                  title="Mark as waiting for follow-up"
                >
                  ⟳
                </button>
              )}
              <button 
                className="text-red-400 hover:text-red-600 px-2 py-1 text-xl font-light"
                onClick={() => onDelete(task.id)}
              >
                ×
              </button>
            </div>
          )}
        </div>
        
        {task.status === STATUS.PENDING_FOLLOWUP && task.followupWith && (
          <div className="ml-16 mt-1 text-sm text-yellow-600">
            Waiting on: {task.followupWith}
          </div>
        )}
        
        {/* Time spent (if already completed and not in history view) */}
        {task.status === STATUS.COMPLETED && !isHistory && task.timeSpent > 0 && (
          <div className="ml-16 mt-1 text-sm text-gray-500">
            Time spent: {formatTimeSpent(task.timeSpent)}
          </div>
        )}
        
        {/* Checklist (expanded) */}
        {task.isExpanded && !isHistory && (
          <div className="ml-16 mt-3">
            {task.checklist.length > 0 ? (
              <ul className="space-y-2">
                {task.checklist.map(item => (
                  <li key={item.id} className="flex items-center">
                    <button 
                      className={`w-4 h-4 rounded-sm border mr-2 flex items-center justify-center 
                        ${item.completed ? 'bg-green-500 border-green-500' : 'border-gray-400'}`}
                      onClick={() => onToggleChecklistItem(task.id, item.id)}
                    >
                      {item.completed && (
                        <span className="text-white text-xs">✓</span>
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                      {item.text}
                    </span>
                    <button 
                      className="text-gray-400 hover:text-gray-600 text-xs"
                      onClick={() => onDeleteChecklistItem(task.id, item.id)}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No checklist items yet.</p>
            )}
            
            {/* Add checklist item */}
            <div className="flex mt-2">
              <input 
                type="text"
                className="flex-1 border border-gray-300 rounded-l-md p-1 text-sm"
                placeholder="Add item..."
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onAddChecklistItem(task.id);
                  }
                }}
              />
              <button
                className="bg-blue-500 text-white px-2 py-1 rounded-r-md text-sm"
                onClick={() => onAddChecklistItem(task.id)}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
};

export default TodoAppComplete;