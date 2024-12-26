
function CreateMultiLineChart(ActiveCases , RecoveredCases , TotalDeaths){
    // Set the dimensions of the canvas / graph
var margin = {top: 30, right: 250, bottom: 30, left: 80},
    width = 1300 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// Set the ranges
var x = d3.scaleTime().range([0, width]);  
var y = d3.scaleLinear().range([height, 0]);

// Define the lines
    var activeLine = d3.line()	
                        .x(function(d) { return x(d.date); })
                        .y(function(d) { return y(d.active); });

    var recoveredLine = d3.line()	
                        .x(function(d) { return x(d.date); })
                        .y(function(d) { return y(d.recovered); });

    var deathsLine = d3.line()	
                        .x(function(d) { return x(d.date); })
                        .y(function(d) { return y(d.deaths); });

//set the color range
var color = d3.scaleOrdinal(d3.schemeCategory10);    

// Add the svg canvas
var svg = d3.select("body")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");

    //select the date columns
    var dataColumns = ActiveCases.columns.slice(1,ActiveCases.columns.length);
    //function for time parse
    var parseDate = d3.timeParse("%d/%m/%Y");

    var nestedData = [] , SelectedCountryList = [] , SumActiveCases = [];

   
    //create nested data for creating multi-line chart
    ActiveCases.forEach(function(d,i){
        var obj1 = {}
        obj1.key = ActiveCases[i]['Country_Region'];
        var numbers = []
        dataColumns.forEach(element => {
            numbers.push({date:parseDate(element) ,active: parseInt(ActiveCases[i][element]), recovered: parseInt(RecoveredCases[i][element]) , deaths: parseInt(TotalDeaths[i][element]) })
        });
        Total = d3.sum(numbers, function(d) {
                    return d.active;
                });
        SumActiveCases.push({country: ActiveCases[i]['Country_Region'] , infected:Total})
        obj1.values = numbers
        nestedData.push(obj1)
    })
    //select top 5 countries by sorting the countries by infected case
    var TopFiveCountries = SumActiveCases.sort(function(a, b){return b.infected - a.infected}).slice(0, 5)
    console.log('top 5' , TopFiveCountries)

    //get the maximum number of active cases
    var maxActive = d3.max(d3.entries(nestedData), function(d) {
    return d3.max(d3.entries(d.value.values), function(e) {
        return d3.max(d3.entries(e.value), function(f){
        return (e.value.active);
        })
    });
    })
    //get the maximum number of recovered cases
    var maxRecovered = d3.max(d3.entries(nestedData), function(d) {
        return d3.max(d3.entries(d.value.values), function(e) {
            return d3.max(d3.entries(e.value), function(f){
            return (e.value.recovered);
            })
        });
    })
    //get the maximum number of deaths
    var maxDeaths = d3.max(d3.entries(nestedData), function(d) {
        return d3.max(d3.entries(d.value.values), function(e) {
            return d3.max(d3.entries(e.value), function(f){
            return (e.value.deaths);
            })
        });
    })
    //get the maximum of all 3 attributes to get the y-scale
var max = Math.max(maxActive , maxDeaths , maxRecovered)
console.log('max' , max)

//set the minimum number for y-scale as 0
var min = 0

    // Set the x and y domain of the data
    //set the x domain as start and end date
    x.domain([parseDate(dataColumns[0]) , parseDate(dataColumns[dataColumns.length - 1])]);

    //set the y domain as min and max value
    y.domain([min , max]);

    // Add the X Axis
    svg.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    // Add the Y Axis
    svg.append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(25));

        // add the Y gridlines
    svg.append("g")			
      .attr("class", "grid")
      .call(d3.axisLeft(y).ticks(25)
          .tickSize(-width)
          .tickFormat("")
      )
    // Loop through each symbol / key and create background line
    nestedData.forEach(function(d , i) { 

    svg.append("path")
        .attr("class", "line")
        .attr("d", activeLine(d.values))
        .style('stroke' , 'grey')
        .style('opacity' , '0.5')

    });

    //append line legend
    svg.append('line')
        .style("stroke", "black")
        .style("stroke-width", 2)
        .attr("x1", width+10)
        .attr("y1", height-100)
        .attr("x2", width + 80)
        .attr("y2", height-100); 

    svg.append("text")
                .attr("x", width+85)  
                .attr("y", height-100) 
                .text("Active Cases")

    svg.append('line')
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style("stroke-dasharray", ("3, 3"))
        .attr("x1", width+10)
        .attr("y1", height-60)
        .attr("x2", width + 80)
        .attr("y2", height-60); 

    svg.append("text")
                .attr("x", width+85)  
                .attr("y", height-60) 
                .text("Recovered")

    svg.append('line')
        .style("stroke", "black")
        .style("stroke-width", 2)
        .style("stroke-dasharray", ("10, 10"))
        .attr("x1", width+10)
        .attr("y1", height-20)
        .attr("x2", width + 80)
        .attr("y2", height-20); 

    svg.append("text")
                .attr("x", width+85)  
                .attr("y", height-20) 
                .text("Deaths")

    //append the dropdown
      var dropDown = d3.select("#country_active")
              .append("select")
              .attr("class", 'country_active')
            
            var options = dropDown.selectAll("option")
              .data(nestedData)
              .enter()
              .append("option");
            options.text(function(d) {
                return d.key;
              })
              .attr("value", function(d) {
                return d.key;
              })
              d3.select("#country_active select")
              .on("change",function(d){
                SelectedCountry = d3.select('select.country_active option:checked').text()
                if((SelectedCountryList.indexOf(SelectedCountry) === -1) && (SelectedCountryList.length !=5))
                {
                    SelectedCountryList.push(SelectedCountry)
                }
                else if(SelectedCountryList.length == 5){
                    alert("You cannot select more than 5 countries.")
                }
                updateForegroundLines()
                console.log(SelectedCountryList)
  })
  
        //check for the changes in check box
        const checkbox = document.getElementById('topFive')

        checkbox.addEventListener('change', (event) => {
            //if checkbox is selected, empty the selected country list, add top countries and update foreground lines
        if (event.currentTarget.checked) {
            SelectedCountryList = [];
            TopFiveCountries.forEach(element=>{
                SelectedCountryList.push(element.country)
            })
            updateForegroundLines()

        } else {
            SelectedCountryList = [];
            updateForegroundLines()            
        }
        })

//function to update foreground lines
  function updateForegroundLines(){
    var count  = 0
    //remove all already created forefround lines
                d3.selectAll('#foreground').remove()
                //create the foreground lines for countries only in the selected country list
                nestedData.forEach(function(d , i) { 
                    if(SelectedCountryList.indexOf(d.key) !== -1)
                    {
                        //add active cases line
                        svg.append("path")
                        .attr("class", "line")
                        .attr('id' , 'foreground')
                        .attr("d", activeLine(d.values))   
                        .style("stroke", function() { // Add the colours dynamically
                            return d.color = color(d.key); })
                        
                        //add recovered cases line
                        svg.append("path")
                        .attr("class", "line")
                        .attr('id' , 'foreground')
                        .attr("d", recoveredLine(d.values))  
                        .style("stroke-dasharray", ("3, 3"))
                        .style("stroke", function() { // Add the colours dynamically
                            return d.color = color(d.key); })

                        //add deaths line
                        svg.append("path")
                        .attr("class", "line")
                        .attr('id' , 'foreground')
                        .attr("d", deathsLine(d.values))  
                        .style("stroke-dasharray", ("10, 10"))
                        .style("stroke", function() { // Add the colours dynamically
                            return d.color = color(d.key); })

                        // Add the Legend
                       svg.append("text")
                        .attr("x", width+10)  
                        .attr("y", (10 + count*25)) 
                        .attr("class", "legend")
                        .attr('id' , 'foreground')    
                        .style("fill", function() { // Add the colours dynamically
                            return d.color = color(d.key); })
                        .text(d.key)
                        .style("font-size", "25px")
                        .on('click' , function(){
                            console.log(d.key)
                            SelectedCountryList  =SelectedCountryList.filter(x=>{return x != d.key})
                            updateForegroundLines()
                        })
                        count ++
                    }
                   

                    });
  }
}
