var years = [];
var countries = [];

function loadFunc() {
    var tablesRequest = new XMLHttpRequest();
    const url = 'http://localhost:8080/tableNames';
    tablesRequest.open("GET", url);
    tablesRequest.send();
    tablesRequest.onreadystatechange = (e) => {
        var tablesText = tablesRequest.responseText
        var selectTable = document.getElementById("selectTable");
        var options = tablesText.split(";");
        var length = selectTable.options.length;
        for (i = length - 1; i >= 0; i--) {
            selectTable.options[i] = null;
        }
        for (var i = 1; i < options.length-1; i++) {
            var opt = options[i];
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            selectTable.appendChild(el);
        }

        var yearsRequest = new XMLHttpRequest();
        yearsRequest.open("GET", 'http://localhost:8080/years');
        yearsRequest.send();
        yearsRequest.onreadystatechange = (e) => {
            var splitYears = yearsRequest.responseText.split(';');
            for (var i = 1; i < splitYears.length-1; i++) {
                var temp = splitYears[i].split(",");
                years[i-1] = { year_id: temp[0].replace('}', '').replace('"', ''), year_value: temp[1].replace('}', '').replace('"', '') };
            }

            var countriesRequest = new XMLHttpRequest();
            countriesRequest.open("GET", 'http://localhost:8080/countries');
            countriesRequest.send();
            countriesRequest.onreadystatechange = (e) => {
                var splitCountries = countriesRequest.responseText.split(';');
                countries.length = 0;
                var selectCountry = document.getElementById("selectCountry");
                var length = selectCountry.options.length;
                for (i = length - 1; i >= 0; i--) {
                    selectCountry.options[i] = null;
                }
                for (var j = 1; j < splitCountries.length-1; j++) {
                    var temp = splitCountries[j].split("+");
                    countries[j-1] = { country_id: temp[0].replace('}', '').replace('"', ''), country_name: temp[1].replace('}', '').replace('"', '') };
                    var opt = countries[j-1].country_name;
                    var el = document.createElement("option");
                    el.textContent = opt;
                    el.value = opt;
                    selectCountry.appendChild(el);
                };
            };
        };
    };

    var slider = document.getElementById('yearsSlider');
    slider.style.height = '20px';
    slider.style.margin = '40px';
    noUiSlider.create(slider, {
        start: [1900, 2020],
        connect: [false, true, false],
        tooltips: [wNumb({ decimals: 0 }), wNumb({ decimals: 0 })],
        step: 1,
        format: wNumb({
            decimals: 0
        }),
        range: {
            'min': [1800],
            'max': [2100]
        }
    });//load years slider
}

function showGraph() {
    var data = [];
    var table = document.getElementById('selectTable').value;
    var country = document.getElementById('selectCountry').value;
    var slider = document.getElementById('yearsSlider');
    var yearsRange = slider.noUiSlider.get();
    if (table == "Choose Table") {
        alert("Please choose table");
        return;
    }
    var http = new XMLHttpRequest();
    const url = 'http://localhost:8080/data?table=' + table + "&country=" + countries.find(x => x.country_name == country).country_id;
    console.log(url);
    http.open("GET", url);
    http.send();
    http.onreadystatechange = (e) => {
        var rem = document.getElementById("scatter");
        rem.parentNode.removeChild(rem);
        var div = document.createElement('div');
        div.setAttribute("id", "scatter");
        document.body.appendChild(div);
        var dataText = http.responseText;
        var dataArray = dataText.split(";");
        for (var i = 1; i < dataArray.length-1; i++) {
            var temp = dataArray[i].split(',');

            data[i-1] = { year_value: years.find(x => x.year_id == temp[1]).year_value, value: temp[0]};
        }
        data = data.filter(datapoint => (datapoint.year_value >= yearsRange[0] & datapoint.year_value <= yearsRange[1]));
        data.sort(function(a,b) {return a.year_value-b.year_value});
        console.log(data);
        var margin = {
            top: 20,
            right: 20,
            bottom: 30,
            left: 40
        }
        width = 700 - margin.left - margin.right;
        height = 500 - margin.top - margin.bottom;

        var x = d3.scaleTime().range([0, width]);
        var y = d3.scaleLinear().range([height, 0]);
        // Scale the range of the data
        x.domain(d3.extent(data, function (d) {
            return d.year_value;
        }));
        y.domain([0, d3.max(data, function (d) {
            return d.value;
        })]);

        var valueline = d3.line()
            .x(function (d) {
                return x(d.year_value);
            })
            .y(function (d) {
                return y(d.value);
            });

        var svg = d3.select("#scatter").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var path = svg.selectAll("dot")
            .data(data)
            .enter().append("circle")
            .attr("r", 5)
            .attr("cx", function (d) {
                return x(d.year_value);
            })
            .attr("cy", function (d) {
                return y(d.value);
            })
            .attr("stroke", "#32CD32")
            .attr("stroke-width", 1.5)
            .attr("fill", "#FFFFFF");

        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x));
        svg.append("g")
            .call(d3.axisLeft(y).tickFormat(function (d) {
                return d3.format(".3f")(d)
            }));
    };
}
