document.getElementsByClassName('pad1')[0].getElementsByTagName('h1')[0].innerHTML =
  'Spr Messenger Client Test Coverage Report';

const tableBody = document.getElementsByClassName('coverage-summary')[0].getElementsByTagName('tbody')[0];
const tableHead = document.getElementsByClassName('coverage-summary')[0].getElementsByTagName('thead')[0];

const testCountHead = document.createElement('th');
testCountHead.setAttribute('data-col', 'test-count');
testCountHead.setAttribute('data-type', 'number');
testCountHead.setAttribute('data-fmt', 'html');
testCountHead.setAttribute('class', 'abs');
testCountHead.innerHTML = 'Test cases count';

// Insert "test cases count" table head into the tr of head
tableHead
  .getElementsByTagName('tr')[0]
  .insertBefore(testCountHead, tableHead.getElementsByTagName('tr')[0].childNodes[2]);

// Inset "test cases count" data to table
const allRows = tableBody.getElementsByTagName('tr');
for (let i = 0; i < allRows.length; i += 1) {
  const currentRow = allRows[i];
}

// Append no test packages into table
window.summaryData.forEach(({ package, data }) => {
  if (!data || !data.lines.total) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
          <td>${package}</td>
          <td>There is no test in this package!</td>
          `;
    tr.style.color = 'white';
    tr.style.background = 'red';
    tableBody.appendChild(tr);
  } else {
    const correspondingRow = document.querySelector(`[data-value='${package}']`).parentElement;
    const newCell = correspondingRow.insertCell(1);
    newCell.setAttribute('data-value', data.numTotalTests);
    newCell.setAttribute('class', correspondingRow.cells[0].getAttribute('class').replace('file', 'abs'));
    newCell.innerHTML = data.numTotalTests;
  }
});
