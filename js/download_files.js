var selectedFiles = []
var checkboxes = document.querySelectorAll('input[type=checkbox]')
var folder = "files/";

checkboxes.forEach(function(checkbox) {
    checkbox.addEventListener('change', function() {
        handleCheckboxChange(this);
    });
});

function handleCheckboxChange(checkbox) {
    const fileName = checkbox.getAttribute('data-filename');
            
    if (checkbox.checked) {
        // Add to array if not already present
        if (!selectedFiles.includes(fileName)) {
            selectedFiles.push(fileName);
        }
    } else {
        // Remove from array
        const index = selectedFiles.indexOf(fileName);
        if (index > -1) {
            selectedFiles.splice(index, 1);
        }
    }
    console.log(selectedFiles);
    console.log(fileName);
}

function downloadFiles() {
    selectedFiles.forEach(function(filename, index) {
        setTimeout(function(){
          var link = document.createElement('a');
          link.href = folder + filename;
          link.download = filename; 
          link.click();
    }, index * 2000);
    });
};

function addSelectAllButton() {
            const selectAllBtn = document.createElement('button');
            selectAllBtn.classList.add("btn");
            selectAllBtn.classList.add("btn-link");
            selectAllBtn.textContent = 'Select All';
            selectAllBtn.onclick = function() {
                checkboxes.forEach(cb => {
                    cb.checked = true;
                    handleCheckboxChange(cb);
                });
            };
            
            const clearAllBtn = document.createElement('button');
            clearAllBtn.textContent = 'Clear All';
            clearAllBtn.classList.add("btn");
            clearAllBtn.classList.add("btn-link");
            clearAllBtn.onclick = function() {
                checkboxes.forEach(cb => {
                    cb.checked = false;
                    handleCheckboxChange(cb);
                });
            };
            
            const filesSection = document.querySelector('.download-area');
            filesSection.insertBefore(clearAllBtn, filesSection.firstElementChild.nextSibling);
            filesSection.insertBefore(selectAllBtn, clearAllBtn);
        }
        
        // Initialize the select all buttons
        addSelectAllButton();