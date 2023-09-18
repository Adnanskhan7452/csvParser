document.addEventListener("DOMContentLoaded", function() {
    const csvFileInput = document.getElementById("csvFile");
    const parseButton = document.getElementById("parseButton");
    const downloadLink = document.getElementById("downloadLink");

    parseButton.addEventListener("click", function() {
        const file = csvFileInput.files[0];

        if (file) {
            parseCSV(file);
        } else {
            alert("Please choose a .csv file.");
        }
    });

    function parseCSV(file) {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: function(results) {
                const outputData = processCSVData(results.data);
                if (outputData) {
                    const blob = new Blob([outputData], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    downloadLink.href = url;
                    downloadLink.style.display = "block";
                } else {
                    alert("Error processing CSV data.");
                }
            },
            error: function(error) {
                console.error("CSV parsing error:", error.message);
                alert("Error parsing CSV data.");
            }
        });
    }

    function processCSVData(data) {
        const idToIndexMarks = {};
        const idToStrategies = {};
        const idToIndexes = {};
        const idToMarks = {};

        // Process the CSV data and populate the maps
        data.forEach(row => {
            const id = parseInt(row['ID']);
            const index = row['Index'];
            const mark = row['Mark'];
            const strategy = row['Strategy'];

            if (!idToIndexMarks[id]) {
                idToIndexMarks[id] = {};
                idToStrategies[id] = new Set();
                idToIndexes[id] = new Set();
                idToMarks[id] = new Set();
            }

            if (!idToIndexMarks[id][index]) {
                idToIndexMarks[id][index] = new Set();
            }

            idToIndexMarks[id][index].add(mark);
            idToStrategies[id].add(strategy);
            idToIndexes[id].add(index);
            idToMarks[id].add(mark);
        });

        // Generate the output in the desired format
        let output = "Stream , Indexes , Symbol , Option_type\n";

        for (const id in idToStrategies) {
            const strategies = Array.from(idToStrategies[id]).join('/');
            const indexes = [];

            for (const index of idToIndexes[id]) {
                if (idToIndexMarks[id][index].size > 1) {
                    const marks = Array.from(idToIndexMarks[id][index]).join('/');
                    indexes.push(`${index}(${marks})`);
                } else {
                    const mark = Array.from(idToIndexMarks[id][index])[0];
                    indexes.push(`${index}(${mark})`);
                }
            }

            const marks = Array.from(idToMarks[id]).join('/');
            output += `${id} , ${strategies} , ${indexes.join('/')} , ${marks}\n`;
        }
        csvFileInput.value = null;
        return output;
    }
});
