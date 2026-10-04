const startButton = document.getElementById('start-btn');
const stopButton = document.getElementById('stop-btn');
const tableContainer = document.createElement('div');
tableContainer.classList.add('data-container');
const table = document.createElement('table');
table.innerHTML = `
    <thead style="color: #F2F2F2">
        <tr style="font-weight: 500">
            <th>البروتوكول</th>
            <th>العنوان المحلي</th>
            <th>العنوان البعيد</th>
            <th>الحالة</th>
        </tr>
    </thead>
    <tbody id="network-table"></tbody>
`;
tableContainer.appendChild(table);
document.body.appendChild(tableContainer);
tableContainer.style.display = 'none';

let socket;
let monitoring = false;

stopButton.style.display = 'none';

startButton.addEventListener('click', function() {
    if (monitoring) return;
    
    socket = io();
    tableContainer.style.display = 'block';
    monitoring = true;
    startButton.style.display = 'none';
    stopButton.style.display = 'inline-block';

    socket.on('connect', () => { console.log('تم الاتصال بالخادم عبر Socket.io'); });

    socket.on('networkData', (data) => {
        const tableBody = document.getElementById('network-table');
        tableBody.innerHTML = '';
        data.forEach(row => {
            const tr = document.createElement('tr');
            row.forEach(cell => {
                const td = document.createElement('td');
                td.textContent = cell;
                tr.appendChild(td);
            });
            tableBody.appendChild(tr);
        });
    });

    socket.on('disconnect', () => { console.log('تم قطع الاتصال بالخادم'); });

    socket.on('connect_error', (error) => { console.log('خطأ في الاتصال:', error); });
});

stopButton.addEventListener('click', function() {
    if (!monitoring) return;
    
    socket.disconnect();
    monitoring = false;
    startButton.style.display = 'inline-block';
    stopButton.style.display = 'none';
});