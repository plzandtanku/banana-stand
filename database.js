const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/mydb";

MongoClient.connect(url,{ useNewUrlParser: true }, function(err, db) {
  if (err) throw err;
  initCollection(db);
});

function initCollection(db){
	let dbo = db.db("inventory");
	dbo.createCollection("bananas", function(err, res) {
		if (err) throw err;
		console.log("Collection created!");
		db.close();
	});
	var myobj = { 
		purchased: "", 
		sold: "",
		name:"the test banana" 
	};
	dbo.collection("bananas").insertOne(myobj, function(err, res) {
		if (err) throw err;
		console.log("1 document inserted");
		db.close();
	});
	/**
	var myobj = { 
		purchased: "", 
		sold: "Highway 37" 
	};
	dbo.collection("bananas").insertOne(myobj, function(err, res) {
		if (err) throw err;
		console.log("1 document inserted");
		db.close();
	});
	**/
}

