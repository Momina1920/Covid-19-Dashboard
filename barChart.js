
    function addLegend(data){
        //add country legend
          // Add the Legend
          var color =  d3.scaleOrdinal(d3.schemeCategory10);
          var legend = d3.select('.pieLegend').append("svg")
              .attr("width", 200)
              .attr("height", 2400)
              .append("g")
  
              data.forEach((d,i)=>{
                legend.append("text")
                          .attr("x",0)  
                          .attr("y", (10 + i*12)) 
                          .attr("class", "legend")
                          .attr('id' , 'foreground')    
                          .style("fill", function() { // Add the colours dynamically
                              return d.color = color(d.Country_Region); })
                          .text(d.Country_Region)
                          .style("font-size", "12px")
              })
  
         
      }
  
  function drawDropDown(data){
  
    //add dropdown
        var dropDown = d3.select("#country_active")
                .append("select")
                .attr("class", 'country_active')
              
              var options = dropDown.selectAll("option")
                .data(data)
                .enter()
                .append("option");
              options.text(function(d) {
                  return d.Country_Region;
                })
                .attr("value", function(d) {
                  return d.Country_Region;
                })
                d3.select("#country_active select")
                .on("change",function(d){
                  document.getElementById('showAll').checked = false
                  SelectedCountry = d3.select('select.country_active option:checked').text()
                  var filteredData = data.filter(d=>{return d.Country_Region == SelectedCountry})
                  DrawPieChart('#deaths' ,  'Deaths' , filteredData)
                  DrawPieChart('#active' ,  'Active' , filteredData)
                  DrawPieChart('#recovered' ,  'Recovered' , filteredData)
  
    })
  }
  
  function drawBarChart(d){
    //set chart margings and width and height
  var m = {top: 60, right: 20, bottom: 20, left: 200};
  var w_view = 950;
  var h_view = 5000;
  var w_chart  = w_view - m.left - m.right;
  var h_chart = h_view - m.top - m.bottom;
  
  // select svg
  var svg = d3.select(".Content")
              .append("svg")
              .attr("class", "svg")
              .attr("width", w_view)
              .attr("height", h_view);
  // x axis label
  svg.append("g")
     .append("text")
     .attr("class", "label-axis")
     .attr("transform", "rotate(-90)")
     .attr("x", -h_chart/2 -m.top)
     .attr("y", 20)
     .text("Country_Region")
     .style("text-anchor", "middle");
  
  // y axis label
  svg.append("g")
     .append("text")
     .attr("class", "label-axis")
     .attr("x", w_chart/2 + m.left)
     .attr("y", 20)
     .text("Active")
     .style("text-anchor", "middle");
  
  // x and y ranges
  var y = d3.scaleBand()
            .range([h_chart + m.top, m.top])
            .padding(0.2);       // space between bars
  
  var x = d3.scaleLinear()
            .range([m.left, w_chart + m.left]);
            d.sort( (a, b) => a.Active - b.Active );
  
  // x and y axes
  y.domain( d.map(d => d.Country_Region) )
  x.domain( [0, d3.max(d, d => +d.Active)] );
  
  // bars
  svg.append("g")
     .selectAll("rect")
     .data(d)
     .join("rect")
     .attr("y", d => y(d.Country_Region))
     .attr("x", m.left)
     .attr("height",  y.bandwidth())
     .attr("width", d => x(d.Active) - m.left)
     .style("fill", 'steelblue')
     .on('mousemove', function(d){
              d3.select(this).style("cursor", "pointer"); 
              tooltip
              .style('opacity' , 1)
                .html('Country: ' +d.Country_Region  +"<br>Active Cases: " + d.Active)
                .style("left", ( d3.event.pageX)  +"px") 
                .style("top", (d3.event.pageY - 40) + "px")
                .style('background-color' , 'black')
                .style("fill-opacity","0.5")
          })
          .on('mouseout' , function(d){
              d3.select(this).style("cursor", "default"); 
  
              tooltip.style('opacity' , 0).html('')
                .style("left", (0) + "px") 
                .style("top", (0) + "px")
          }) 
  
  // x and y axes
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", "translate(0,"+ m.top +")")
    .call(d3.axisTop(x));
  
  svg.append("g")
   .attr("class", "axis")
   .attr("transform", "translate("+ m.left +",0)")
   .call(d3.axisLeft(y));
  }
  
  
  function DrawPieChart(divID , attribute ,data ){
      
    d3.select(divID+' svg').remove()
    
    //set chart margings and width and height
      var width = 400,
      height = 400,
      margin = 60,
      radius = Math.min(width, height) / 2 - margin;
  
      var attribute;
  
      var svg = d3.select(divID).append("svg")
              .attr("width", width)
              .attr("height", height)
          .append("g")
              .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
  
              //sum the data to calculate percentages
          var sumOfData = d3.sum(data.map(function(d){ return d[attribute]}))
  
          let config = {
          min: 0,
          max: data.length,
          chunkSize: 0
      };
     
        //set color
          var color =  d3.scaleOrdinal(d3.schemeCategory10);
          //set the arc function for the pies
          var arc = d3.arc()
              .outerRadius(radius - 10)
              .innerRadius(0);
  
          //set the pie function
          var pie = d3.pie()
              .sort(null)
              .value(function(d) { return d[attribute]; });
  
          //draw the arcs
          var g = svg.selectAll(".arc")
              .data(pie(data))
              .enter().append("g")
              .attr("class", "arc");
  
          //join the arcs
          g.append("path")
              .attr("d", arc)
              .attr('id' , 'sup')
              .style("fill", function(d) { return color(d.data.Country_Region); })
              .on('mousemove', function(d){
              d3.select(this).style("cursor", "pointer"); 
              tooltip
              .style('opacity' , 1)
                .html(d.data.Country_Region  +"<br>" + d.data[attribute] +"<br>" +((d.data[attribute]/sumOfData)*100).toFixed(1) + '%')
                .style("left", ( d3.event.pageX)  +"px") 
                .style("top", (d3.event.pageY - 40) + "px")
                .style('background-color' , 'black')
                .style("fill-opacity","0.5")
          })
          .on('mouseout' , function(d){
              d3.select(this).style("cursor", "default"); 
  
              tooltip.style('opacity' , 0).html('')
                .style("left", (0) + "px") 
                .style("top", (0) + "px")
          }) 
  
  
  // The arc generator
  var arc = d3.arc()
    .innerRadius(radius * 0.5)     
    .outerRadius(radius * 0.8)
  
  // Another arc that won't be drawn. Just for labels positioning
  var outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9)
  
  
  
  //append the labels 
  svg
    .selectAll('allLabels')
    .data(pie(data))
    .enter()
    .append('text')
    .attr("id", function(d) { return (d.data['Country_Region'].replace(/[^a-zA-Z ]/g, "").replace(/ .*/,'')); })
    .style("font-size", "10px")
    .attr('transform', function(d) {
          var pos = outerArc.centroid(d);
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          pos[0] = radius * 0.99 * (midangle < Math.PI ? 1 : -1);
          return 'translate(' + pos + ')';
      })
      .style('text-anchor', function(d) {
          var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2
          return (midangle < Math.PI ? 'start' : 'end')
      })
      .text( function(d) { 
          // if(topCountries.indexOf(d.data.Country_Region) === -1)
          // return ""
          // else
          return d.data.Country_Region } )
      
  
      // Add the polylines between chart and labels:
  svg
    .selectAll('allLabels')
    .data(pie(data))
    .enter()
    .append('polyline')
    .attr("id", function(d) { return (d.data['Country_Region'].replace(/[^a-zA-Z ]/g, "").replace(/ .*/,'')); })
      .attr("stroke", "black")
      .style("fill", "none")
      .attr("stroke-width", 1)
      .attr('points', function(d) {
        var posA = arc.centroid(d) // line insertion in the slice
        var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
        var posC = outerArc.centroid(d); // Label position = almost the same as posB
        var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
        posC[0] = radius * 0.9 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
        return [posA, posB, posC]
      })
  
      //show only labels of top 10 countries, remove the others
      dataset = data
     dataset = dataset.sort(function(a, b){return a[attribute] - b[attribute]}).slice(0, 190)
  
       console.log(dataset)
      var lowestCountries = []
      dataset.forEach(element => {
          lowestCountries.push(element.Country_Region.replace(/[^a-zA-Z ]/g, "").replace(/ .*/,''))
      });
      lowestCountries.forEach(element=>{
          d3.selectAll(divID+' svg g text'+'#'+element).remove()
          d3.selectAll(divID+' svg g polyline'+'#'+element).remove()
      })
  
      
  }
  