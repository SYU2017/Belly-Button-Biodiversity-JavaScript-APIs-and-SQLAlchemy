
function getData(sample, callback) {

    
  Plotly.d3.json(`/samples/${sample}`, function(error, sample_value_data) {
      if (error) return console.warn(error);
      console.log(sample_value_data);

      Plotly.d3.json('/otu', function(error, otu_data) {
          if (error) return console.warn(error);
          console.log(otu_data);

          callback(sample_value_data, otu_data);
      });
  });
  Plotly.d3.json(`/metadata/${sample}`, function(error, meta_data) {
      if (error) return console.warn(error);
      console.log(meta_data);
      update_metaData(meta_data);
  });
   
  Plotly.d3.json(`/wfreq/${sample}`, function(error, wfreq_data) {
        if (error) return console.warn(error);
        console.log(wfreq_data);
  });
        
};


function update_metaData(meta_data) {
    
    var Panel = document.getElementById("sample-metadata");
   
    Panel.innerHTML = '';
    
    for(var key in meta_data) {
        h6tag = document.createElement("h6");
        h6Text = document.createTextNode(`${key}: ${meta_data[key]}`);
        h6tag.append(h6Text);
        Panel.appendChild(h6tag);
        
    }
};

function build_charts( sample_value_data, otu_data, wfreq_data) {
    

    var OTU_Description = sample_value_data[0]['otu_ids'].map(function(item) {
        return otu_data[item]
    });

    // Build Pie Chart
    
    console.log(sample_value_data[0]['sample_values'].slice(0, 10))
    var pie_data = [{
        values: sample_value_data[0]['sample_values'].slice(0, 10),
        labels: sample_value_data[0]['otu_ids'].slice(0, 10),
        hovertext:  OTU_Description.slice(0, 10),
        hoverinfo: 'hovertext',
        type: 'pie'
    }];
    var pie_layout = {

          margin: { t: 2, b: 2},
          height: 600,
          width: 600
  
    };
    var Pie = document.getElementById('pie-chart');
    Plotly.plot(Pie, pie_data, pie_layout);


    // Build Bubble Chart
    var bubble_data = [{
        x: sample_value_data[0]['otu_ids'],
        y: sample_value_data[0]['sample_values'],
        text: OTU_Description,
        mode: 'markers',
        marker: {
            size: sample_value_data[0]['sample_values'],
            color: sample_value_data[0]['otu_ids'],
            colorscale: "Jet",
        }
    }];
    var bubble_layout = {
        margin: {l: 5, r: 5, b: 10,  t: 10,  pad:0},
        hovermode: 'closest',
        height: 800,
        width: 1200,
        xaxis: { title: "OTU IDs" },
        yaxis: { title: "Sample Values" }
                   
    };
    
    var Bubble = document.getElementById('bubble-chart');
    Plotly.plot(Bubble, bubble_data, bubble_layout);
    

    // Build gauge Chart
  
    // Enter a speed between 0 and 180
    var level =wfreq_data[0]['WFREQ']*18;
    // Trig to calc meter point   
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);
    // Path: may have to change to create a better triangle   
    var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var gauge_data = [{ type: 'scatter',
        x: [0], y:[0],
          marker: {size: 20, color:'850000'},
          showlegend: false,
          name: 'Freq',
          text: level,
          hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(0, 105, 11, .5)','rgba(10, 120, 22, .5)',
                        'rgba(14, 127, 0, .5)', 'rgba(110, 154, 22, .5)',
                         'rgba(170, 202, 42, .5)', 'rgba(202, 209, 95, .5)',
                         'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
                         'rgba(240, 230, 215, .5)','rgba(255, 255, 255, 0)']},
    
      labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1', ''],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var gauge_layout = {
      shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
                color: '850000'
            }
      }],
      title: '<h4><strong>Belly Button Washing Frequency</strong></h4> <br> Scrubs per Week',
      height: 500,
      width: 500,
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };
    var gauge = document.getElementById('gauge-chart');
    Plotly.newPlot(gauge, gauge_data, gauge_layout);
    
};


function update_charts(sample_value_data, otu_data, wfreq_data) {

    
    var neww_sample_values = sample_value_data[0]['sample_values'];
    var new_otu_ids = sample_value_data[0]['otu_ids'];
    var new_wfreq = wfreq_data[0]['WFREQ']
    var new_level =new_wfreq*18;
    

    // Return the OTU Description for each otuID in the dataset
    var new_OTU_Description = new_otu_ids.map(function(item) {
        return otu_data[item]
    });
    // Update the Bubble Chart with the new data
    var Bubble = document.getElementById('bubble');
    Plotly.restyle(Bubble, 'x', [new_otu_ids]);
    Plotly.restyle(Bubble, 'y', [new_sample_values]);
    Plotly.restyle(Bubble, 'text', [new_OTU_Description]);
    Plotly.restyle(Bubble, 'marker.size', [new_sample_values]);
    Plotly.restyle(Bubble, 'marker.color', [new_otu_ids]);
    // Update the Pie Chart with the new data
    
    var Pie = document.getElementById('pie');
    Plotly.restyle(Pie, "values",[new_sample_values.slice(0, 10)]);
    Plotly.restyle(Pie, "labels", [new_OTU_Description.slice(0, 10)]);
    Plotly.restyle(Pie, "hovertext", [new_OTU_Description.slice(0, 10)]);
    Plotly.restyle(Pie, "hoverinfo", 'hovertext');
    Plotly.restyle(Pie, "type", 'pie');

    var Gauge = document.getElementById('gauge');
    Plotly.restyle(Gauge, 'text', [new_level]);
    Plotly.restyle(Gauge, 'hoverinfo', [text+name]);
    Plotly.restyle(Gauge, 'textinfo', [text]);

}


function getNames_dropdown_options() {

    var selDataset = document.getElementById('selDataset');
    
    Plotly.d3.json('/names', function(error, sample_names) {
        if (error) return console.warn(error);
        console.log(sample_names);

        for (var i = 0; i < sample_names.length;  i++) {
    
            var currentOption = document.createElement('option');
            currentOption.text = sample_names[i];
            currentOption.value = sample_names[i];
            selDataset.appendChild(currentOption);
        };
        getData(sample_names[0], build_charts);
    });
};

function optionChanged(new_sample) {
    
    getData(new_sample, update_charts);
    
};


function init() {
    getNames_dropdown_options();
}

// Initialize the dashboard
init();

// var selDataset = document.getElementById("selDataset");
// var Panel = document.getElementById("sample-metadata");
// var Pie = document.getElementById("pie");
// var Bubble = document.getElementById("bubble");
// var Gauge = document.getElementById("gauge");
