# PocketPlan

PocketPlan is an expense tracker I made for my Web Technology assignment (Assignment 4, Option A). It is built with only HTML, CSS and JavaScript, with no libraries or frameworks. I wanted something simple where I can note down what I spend, find old entries quickly, and see where most of my money goes.

## What it can do

- Add an expense with a title, amount, category and date
- Check the form before saving (title can't be empty, amount must be more than 0, category and date are required)
- Edit an expense using the same form
- Delete an expense, with a confirmation box first
- Filter expenses by category or by month
- Sort by date or by amount
- Show the total spent, number of expenses and top category at the top
- Show the total of whatever is currently filtered
- Show spending by category as bars (my extra feature)
- Switch between light and dark theme, and remember the choice after refreshing
- Keep all data saved in the browser using localStorage
- Work on phones, where the table changes into cards

## Built with

- HTML5
- CSS3 (Grid, Flexbox, CSS variables, media queries)
- JavaScript (DOM, events, array methods, localStorage)

## Files

- `index.html` has the page structure
- `style.css` has the design, dark theme and phone layout
- `script.js` has all the logic

## How to run

Download the folder and open `index.html` in any browser. Nothing needs to be installed.

## How it works

Each expense is an object, and all of them are kept in one array. Whenever something changes, I update the array first, save it to localStorage using `JSON.stringify()`, and then call `render()`. When the page opens, the saved data is loaded back using `JSON.parse()`.

`render()` is the one function that draws everything: the table, the totals and the category bars. I used `filter()` for filtering, `sort()` for sorting and `reduce()` for adding up totals.

For the Edit and Delete buttons I used event delegation. There is a single click listener on the table body, and each button has `data-action` and `data-id` so the code knows what to do and for which expense.

The same form is used for adding and editing. A hidden input holds the id of the expense being edited. If it is empty, a new expense is added, otherwise the old one is replaced.

The theme button changes the `data-theme` attribute on the `html` tag, and the CSS variables change all the colours together.

## What I learned

How to use localStorage with JSON, how event delegation works, how to build a layout with Grid and Flexbox, and how to make a table turn into cards on small screens.

## Things I want to add later

- A monthly budget warning
- Export and import of data
- Undo after deleting

## Author

Aryan Patil
B.E. CSIT, Ajeenkya DY Patil University
