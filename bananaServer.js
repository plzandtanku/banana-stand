const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');
const port = 5000;
const app = express();

const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";

MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
  if (err) throw err;
  app.locals.db = client.db("inventory");
  app.listen(port, () => console.log(`started meServer on port ${port}`));
}); 



app.get('/api/test', (req, res) => {
	console.log(req.query);
	console.log(req.params);
	const db = req.app.locals.db;
	db.collection("bananas").findOne({}, function(err, result) {
		console.log(result);
	});
	res.send({ stuff: 'this is some stuff' });
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.post('/api/purchase', (req, res) => {
	let amount = req.body.amount;
	let date = req.body.date;
	if (amount !== undefined && date !== undefined) {
		purchasedBananas = [];
		for (let i=0;i<amount;i++){
			purchasedBananas.push({purchased: date});
		}
		const db = req.app.locals.db;
		db.collection("bananas").insertMany(purchasedBananas, function (err, res) {
			if (err) throw err;
		});
	}
	res.send({ stuff: 'done' });
});

app.post('/api/sell', (req, res) =>{
	let amount = req.body.amount;
	let date = req.body.date;
	if (amount !== undefined && date !== undefined) {
		let query = { sold: null};
		let update = {$set: {sold:date}};
		const db = req.app.locals.db;
		/**
		db.collection.find().limit(NUMBER_OF_ITEMS_YOU_WANT_TO_UPDATE).forEach(
    function (e) {
        e.fieldToChange = "blah";
        ....
        db.collection.save(e);
    }
);**/
		db.collection("bananas").find(query).sort({purchased:-1}).
		limit(parseInt(amount)).forEach(function (e) {
			let purchaseDate = new Date(e.purchased);
			let expired = new Date(
				purchaseDate.getFullYear(), 
				purchaseDate.getMonth(),
				purchaseDate.getDate()+10
			);
			let sellDate = new Date(date);
			if (sellDate < expired){
				db.collection("bananas").updateOne({_id:e._id},{ $set: { sold : date}});
			}
		});

	}
	res.send({ stuff: 'done' });
});

app.get('/api/metrics', (req, res) => {
	let start = req.body.start;
	let end = req.body.end;
	if (start !== undefined && end !== undefined) {
		let query = { sold: null};
		const db = req.app.locals.db;
		db.collection("bananas").find({}).toArray(function (e, r) {
			if (e) throw e;
			let result = getMetrics(r, new Date(start), new Date(end));
			res.send(result);
		});
	}else{
		res.send({ stuff: 'donezo' });
	}
});

function getMetrics(arr,start,end){
	soldCount = 0;
	expiredCount = 0;
	inventoryCount = 0;
	arr.forEach(function (e){
		let purchaseDate = new Date(e.purchased);
		let expired = new Date(
			purchaseDate.getFullYear(), 
			purchaseDate.getMonth(),
			purchaseDate.getDate()+10
		);
		let sold = new Date(e.sold);
		if (sold >= start && sold <= end) soldCount++;
		if (expired >= start && expired <= end) expiredCount++; 
		if (purchaseDate >= start && purchaseDate <= end) inventoryCount++;
	});
	profit = (soldCount * 0.35) - (inventoryCount * 0.20);
	let result = `
		# of bananas sold: ${soldCount}
		# of expired bananas: ${expiredCount}
		# of bananas in inventory: ${inventoryCount}
		Total Profit: ${profit.toPrecision(2)} 
	`;	
	console.log(result);
	return result;
}
/**
app.listen(port, () => console.log(`started meServer on port ${port}`));

app.get('/api/test', (req, res) => {
	console.log(req.query);
	console.log(req.params);
	res.send({ stuff: 'this is some stuff' });
});
app.get('/api/data', (req, res) =>{
	let baseUrl =  "https://cloud.iexapis.com/beta/stock/market/list/mostactive";
	let totallySecureKey = "pk_8df50afcae24418c86cb21e7443e0f05";
	//https://cloud.iexapis.com/beta//stock/market/list/mostactive?token=pk_8df50afcae24418c86cb21e7443e0f05
	request({
		url: baseUrl,
		qs: { token: totallySecureKey },
	}, function (err, resp) {
		let stockInfo = JSON.parse(resp.body);
		res.send(stockInfo);
	});
});

**/