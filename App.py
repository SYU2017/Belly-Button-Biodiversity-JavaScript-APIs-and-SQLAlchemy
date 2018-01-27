import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy import Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.sql.expression import cast
from sqlalchemy import create_engine, inspect, func
from sqlalchemy.orm import Session, aliased
from datetime import datetime
import numpy as np
import pandas as pd

from flask import Flask, jsonify


#################################################
# Database Setup
#################################################
engine = create_engine("sqlite:///belly_button_biodiversity.sqlite", echo=False)

# reflect an existing database into a new model
Base = automap_base()
# reflect the tables
Base.prepare(engine, reflect=True)

        # cd 09cd cdSave references to the measurement and station tables
Otu = Base.classes.otu
Samples=Base.classes.samples
Samples_metadata = Base.classes.samples_metadata

# Create our session (link) from Python to the DB
session = Session(engine)

#################################################
# Flask Setup
#################################################
app = Flask(__name__)


#################################################
# Flask Routes
#################################################
# Return the dashboard homepage
@app.route("/")
def welcome():
    return render_template("index.html")

# return List of sample names
@app.route('/names')
def sample_name():
    sampleId_result=Samples.__table__.columns.keys()
    sampleId_result.pop(0)
    return jsonify(sampleId_result)


# return List of OTU descriptions
@app.route('/otu')
def otu():
    Otu_result=session.query(Otu.lowest_taxonomic_unit_found).all()
    Otu_result= list(np.ravel(Otu_result))
    return jsonify(Otu_result)

# return MetaData for a given sample   
@app.route('/metadata/<sample>')
def metadata(sample):
    metadata_results = session.query(Samples_metadata.AGE, Samples_metadata.BBTYPE,
        Samples_metadata.ETHNICITY,
        Samples_metadata.GENDER,
        Samples_metadata.LOCATION,
        Samples_metadata.SAMPLEID).all()
    metadata = []
    for result in metadata_results:
        metadata_dict = {}
        metadata_dict["AGE"] = result[0]
        metadata_dict["BBTYPE"] = result[1]
        metadata_dict["ETHNICITY"] = result[2]
        metadata_dict["GENDER"] = result[3]
        metadata_dict["LOCATION"] = result[4]
        metadata_dict["SAMPLEID"] = result[5]
        
        metadata.append(metadata_dict)
    
    i=0
    sample_metadata=[]
    for i in range(0,len(metadata)): 
        if sample == "BB_"+ str(metadata[i]['SAMPLEID']) :
            one_sample_metadata = metadata[i]
            sample_metadata.append(one_sample_metadata)
        else: 
            i+= 1

    return jsonify(sample_metadata)


# return Weekly Washing Frequency as a number
@app.route('/wfreq/<sample>')
def wfreq(sample):
    WQREF_results= session.query(Samples_metadata.SAMPLEID, Samples_metadata.WFREQ).all()
    
    WQREF_list= []
    for result in WQREF_results:
        row = {"SAMPLEID":"WQREF"}
        row["SAMPLEID"] = result[0]
        row["WQREF"] = result[1]
        WQREF_list.append(row)
    
    i=0
    sample_WQREF=[]
    for i in range(0,len(WQREF_list)): 
        if sample == "BB_"+ str(WQREF_list[i]['SAMPLEID']) :
            one_sample_WQREF = WQREF_list[i]
            sample_WQREF.append(one_sample_WQREF)
        else: 
            i+= 1
            
    return jsonify(sample_WQREF)

# return OTU IDs and Sample Values for a given sample.
@app.route('/samples/<sample>')
def sample_value(sample):
            
    df_data = pd.read_csv("belly_button_biodiversity_samples.csv")
    sampleId_result=Samples.__table__.columns.keys()
    sampleId=sampleId_result.pop(0)
    
    sample_value_list=[]
    for sample_id in sampleId_result:
        sample_value_dict={}
        sample_df = df_data.sort_values(sample_id, ascending=False)
        otu_id= sample_df["otu_id"].tolist()
        sample_value= sample_df[sample_id].tolist()   
        sample_value_dict= {sample_id: {"otu_ids": otu_id, "sample_values": sample_value}}
        sample_value_list.append(sample_value_dict)
    
    i = 0
    onesample_value=[]
    for i in range(0,len(sample_value_list)):
        for k in list(sample_value_list[i].keys()):
            if sample == k:
                one_sample= sample_value_list[i][sample]
                onesample_value.append(one_sample)
            else: 
                i+= 1
   
    return jsonify(onesample_value)

if __name__ == "__main__":
    app.run(debug=True)


