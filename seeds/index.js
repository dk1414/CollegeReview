const mongoose = require('mongoose');
const cities = require('./cities');
const { places, descriptors } = require('./seedHelpers');
const College = require('../models/college');
const colleges = require('./data');

require('dotenv').config();
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });


mongoose.connect('mongodb://localhost:27017/CollegeReview', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});




const seedDB = async () => {
    await College.deleteMany({});

    let numColleges = 0;
    const seedNumber = 300;

    let numSet = new Set();

    while (numColleges < seedNumber) {

        
        const random2973 = Math.floor(Math.random() * 2973);

        if (numSet.has(random2973)){
            console.log("broke out");
            console.log(colleges[random2973].name);
            continue;
        }

        const random1000 = Math.floor(Math.random() * 1000);
        ranCollege = colleges[random2973];
        const price = (ranCollege.in_state_tuition + ranCollege.out_of_state_tuition)/2;



        const college = new College({
            //YOUR USER ID
            author: '632d34061b1b573048d700d3',
            location: `${ranCollege.name}, ${ranCollege.state}`,
            title: ranCollege.name,
            description: `Type: ${ranCollege.type}\nDegree Length: ${ranCollege.degree_length}\nRoom and Board: $${ranCollege.room_and_board}`,
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    -74.0059413,
                    40.7127837,
                ]
            },
            
        })

        const geoData = await geocoder.forwardGeocode({
            query: college.location,
            limit: 1
        }).send()
        college.geometry = geoData.body.features[0].geometry;
        await college.save();
        
        numColleges+=1;
        numSet.add(random2973);
        console.log(numColleges);
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})