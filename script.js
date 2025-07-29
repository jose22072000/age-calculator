const DateTime = luxon.DateTime;

const birthdateInput = document.getElementById('birthdate');
const calendar = document.getElementById('calendar');
const calendarIcon = document.querySelector('.calendar-icon');
const errorDiv = document.getElementById('error');
const resultDiv = document.getElementById('result');
const form = document.getElementById('ageForm');

let selectedDate = null;
let currentMonth = DateTime.now().startOf('month');

// Show calendar when input or icon clicked
birthdateInput.addEventListener('click', toggleCalendar);
calendarIcon.addEventListener('click', toggleCalendar);

function toggleCalendar() {
  if (calendar.style.display === 'none') {
    calendar.style.display = 'block';
    renderCalendar(currentMonth);
  } else {
    calendar.style.display = 'none';
  }
}

// Close calendar if clicked outside
document.addEventListener('click', (e) => {
  if (!calendar.contains(e.target) && e.target !== birthdateInput && e.target !== calendarIcon) {
    calendar.style.display = 'none';
  }
});

// Render calendar for a given month
function renderCalendar(month) {
  calendar.innerHTML = '';

  // Header with month and year and navigation
  const header = document.createElement('div');
  header.className = 'calendar-header';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '<';
  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from firing
    currentMonth = currentMonth.minus({ months: 1 });
    renderCalendar(currentMonth);
  });

  const nextBtn = document.createElement('button');
  nextBtn.textContent = '>';
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent document click from firing
    currentMonth = currentMonth.plus({ months: 1 });
    renderCalendar(currentMonth);
  });

  const monthYear = document.createElement('div');
  monthYear.textContent = month.toFormat('MMMM');

  // Create year dropdown
  const yearSelect = document.createElement('select');
  const currentYear = DateTime.now().year;
  // Show years from 1900 to current year
  for (let y = 1900; y <= currentYear; y++) {
    const option = document.createElement('option');
    option.value = y;
    option.textContent = y;
    if (y === month.year) option.selected = true;
    yearSelect.appendChild(option);
  }
  yearSelect.addEventListener('change', () => {
    currentMonth = currentMonth.set({ year: parseInt(yearSelect.value) });
    renderCalendar(currentMonth);
  });

  header.appendChild(prevBtn);
  header.appendChild(monthYear);
  header.appendChild(yearSelect); // Insert year dropdown here
  header.appendChild(nextBtn);
  calendar.appendChild(header);

  // Days of week
  const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const grid = document.createElement('div');
  grid.className = 'calendar-grid';

  daysOfWeek.forEach(day => {
    const dayElem = document.createElement('div');
    dayElem.className = 'calendar-day';
    dayElem.textContent = day;
    grid.appendChild(dayElem);
  });

  // Calculate days to show
  const firstDayOfMonth = month.startOf('month');
  const lastDayOfMonth = month.endOf('month');
  const startWeekday = firstDayOfMonth.weekday % 7; // Sunday=0 for grid alignment
  const daysInMonth = lastDayOfMonth.day;

  // Fill empty slots before first day
  for (let i = 0; i < startWeekday; i++) {
    const emptyCell = document.createElement('div');
    grid.appendChild(emptyCell);
  }

  // Fill days
  for (let day = 1; day <= daysInMonth; day++) {
    const dateCell = document.createElement('div');
    dateCell.className = 'calendar-date';
    dateCell.textContent = day;

    const thisDate = month.set({ day });

    // Disable future dates
    if (thisDate > DateTime.now()) {
      dateCell.style.color = '#ccc';
      dateCell.style.cursor = 'default';
    } else {
      dateCell.addEventListener('click', () => {
        selectedDate = thisDate;
        birthdateInput.value = selectedDate.toFormat('dd/MM/yyyy');
        calendar.style.display = 'none';
        errorDiv.textContent = '';
        highlightSelectedDate();
      });
    }

    grid.appendChild(dateCell);
  }

  calendar.appendChild(grid);
  highlightSelectedDate();
}

// Highlight the selected date in calendar
function highlightSelectedDate() {
  const dateCells = calendar.querySelectorAll('.calendar-date');
  dateCells.forEach(cell => {
    cell.classList.remove('selected');
    if (selectedDate && cell.textContent == selectedDate.day && currentMonth.hasSame(selectedDate, 'month')) {
      cell.classList.add('selected');
    }
  });
}

// Form submit handler
form.addEventListener('submit', (e) => {
  e.preventDefault();
  errorDiv.textContent = '';
  resultDiv.textContent = '';

  if (!selectedDate) {
    errorDiv.textContent = 'Please select a valid birth date.';
    return;
  }

  const now = DateTime.now();

  if (selectedDate > now) {
    errorDiv.textContent = 'Birth date cannot be in the future.';
    return;
  }

  // Calculate age difference
  const diff = now.diff(selectedDate, ['years', 'months', 'days']).toObject();

  // Format output
  const years = Math.floor(diff.years);
  const months = Math.floor(diff.months);
  const days = Math.floor(diff.days);

  let ageString = 'You are ';
  if (years > 0) ageString += `${years} year${years > 1 ? 's' : ''} `;
  if (months > 0) ageString += `${months} month${months > 1 ? 's' : ''} `;
  if (days > 0) ageString += `${days} day${days > 1 ? 's' : ''} `;
  ageString += 'old';

  resultDiv.textContent = ageString;
});