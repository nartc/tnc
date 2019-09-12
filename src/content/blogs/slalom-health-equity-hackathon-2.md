---
title: Slalom Health Equity Hackathon - Part 2
date: 2019-09-12T17:06:55.354Z
tags: ["Programming", "Hackathon", "AWS Comprehend", "NLP", "MongoDB"]
draft: true
cover: ../covers/health_hack.png
---

Welcome back to part 2 (and probably final part) of my journey through **Slalom Health Equity Hackathon**. As mentioned towards the end of [Part 1](/blogs/slalom-health-equity-hackathon-1), this part will start getting into the weed of fine-tuning the data after we have tried fetching and consolidating everything we're provided by the organizers.

The agenda for this part will be as follow:

1. Web Scraping
2. AWS Comprehend
3. Presentation

> It's worth noting that the organizers did provide an **API Endpoint** for participants to make a request by sending their data and the **endpoint** will return a set of scores so participants could see how they're doing and what they should be improving on.

### Web Scraping

Before our team resorted to **Web Scraping**, we were actually thinking about two different APIs:

1. [Google Places API](https://cloud.google.com/maps-platform/places/): This is a Google's service that provides information about businesses.
2. [Bing Entity Search API](https://azure.microsoft.com/en-us/services/cognitive-services/bing-entity-search-api/): This is pretty much the same service as above but provided by Bing.
3. [Google Custom Search API](https://developers.google.com/custom-search/): This API will allow you to build your custom search.

With the amount of data we had, there's no way to utilize these two APIs without paying or taking turns creating multiple free accounts (which was totally valid) but I'd rather do something simple, quick, and less bothering, especially to my teammates.

> My teammates was working with **Python**, namely **jupyter** and **boto3** to get familiar and adapt to **AWS Comprehend**.

> For projects that are not in Hackathon format, I would totally suggest going for a well-known and fully supported API like **Google Places**. What I am about to do is fun, somewhat effective, and pretty inaccurate 😅

After every consideration for not wanting to pay 3rd-party services, we decided to go with [Puppeteer](https://developers.google.com/custom-search/)

![puppeteer](../images/puppeteer.png)
*Google Chrome Puppeteer*

**Puppeteer** is a Google Chrome Headless API that allows you to basically use Chrome programmatically and automatically. For what **Puppeteer** has to offer, I'd refer you to **Puppeteer README**

![puppeteer_read_me](../images/puppeteer_read_me.png)
*Google Chrome Puppeteer README*

The plan was to have Puppeteer running on the dataset, perform a Google Search with the organization name, and fetch the first URL that Google Search returns. This approach is easy and quick but facing these issues: **inaccurate data** and **advertisement**. Given our time constraint and hackathon format, we decided to go with it anyway. First, I needed to run a query to query for all the Organizations that *DO NOT HAVE* a `WEBSITE` yet.

1. Same ol' setup to start working `MongoDB` and `JavaScript`.

```javascript
const mongo = require('mongodb');

let result = 0;

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }

    const db = client.db('stl-health-hack');
    const col = db.collection('queriedbmfs');
})
```

2. `npm install puppeteer` and start with importing `puppeteer`

```javascript{1}
const puppeteer = require('puppeteer');
const mongo = require('mongodb');

let result = 0;
```

3. Add a query to find all Organizations that do not have `WEBSITE` or have invalid `WEBSITE`

```javascript{20-27}
const puppeteer = require('puppeteer');
const mongo = require('mongodb');

let result = 0;

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }

    const db = client.db('stl-health-hack');
    const col = db.collection('queriedbmfs');

    col.find({$or: [
        {WEBSITE: {$exists: false}},
        {WEBSITE: {$eq: "N/A"}},
        {WEBSITE: {$eq: "NONE"}},
        {WEBSITE:  {$eq: "None"}}
    ]}).toArray(async (err, bmfs) => {
        
    });
})
```

4. Loop through the result and call `getFirstUrl()` and pass in the organization name

```javascript{26-29}
const puppeteer = require('puppeteer');
const mongo = require('mongodb');

let result = 0;

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }

    const db = client.db('stl-health-hack');
    const col = db.collection('queriedbmfs');

    col.find({$or: [
        {WEBSITE: {$exists: false}},
        {WEBSITE: {$eq: "N/A"}},
        {WEBSITE: {$eq: "NONE"}},
        {WEBSITE:  {$eq: "None"}}
    ]}).toArray(async (err, bmfs) => {
        for (let i = 0; i < bmfs.length; i++) {
            const bmf = bmfs[i];
            const href = await getFirstUrl(bmf.NAME);
        }
    });
})
```

> I'll get to `getFirstUrl()` in a bit

5. If `href` (the URL we want) is found, then I want to update the same organization with the newly found URL

```javascript{30}
const puppeteer = require('puppeteer');
const mongo = require('mongodb');

let result = 0;

const client = new mongo.MongoClient('mongodb://localhost:27017', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

client.connect((err) => {
    if (err) {
        console.log(err);
        return;
    }

    const db = client.db('stl-health-hack');
    const col = db.collection('queriedbmfs');

    col.find({$or: [
        {WEBSITE: {$exists: false}},
        {WEBSITE: {$eq: "N/A"}},
        {WEBSITE: {$eq: "NONE"}},
        {WEBSITE:  {$eq: "None"}}
    ]}).toArray(async (err, bmfs) => {
        for (let i = 0; i < bmfs.length; i++) {
            const bmf = bmfs[i];
            const href = await getFirstUrl(bmf.NAME);
            if (href) {
                await col.updateOne({_id: bmf._id}, {$set: {WEBSITE: href}});
            }
        }
    });
})
```

6. Implement `getFirstUrl()`. Everything that happens with `puppeteer` is **asynchronous** operations so I utilize `async/await` here.

```javascript
const getFirstUrl = async (query) => {
    // Just a log for knowing which organization puppeteer is trying to fetch
    console.log(`Getting URL for ${query}`);
    
    // Initialize a browser instance. Default value for "headless" is true which means
    // puppeteer will open up a Chrome/Chromium window
    // I set it to "true" explicitly so you can see there's an option.
    const browser = await puppeteer.launch({headless: true});
    
    // Initialize a new page
    const page = await browser.newPage();
    
    // Go to this URL
    await page.goto('https://google.com');

    // Type in the search box the Organization name. 
    // What you pass in .type() is the input selector. 
    // You can find out about the selectors for all elements in the webpage by using Chrome Dev Tools.
    await page.type("input.gLFyf", query);
    
    // Hit Enter
    await page.keyboard.press(String.fromCharCode(13))
    
    // Wait for the next page's done loading
    await page.waitForNavigation();
    
    // Wait additional 2 seconds for no reason at all
    await page.waitFor(2000);
    
    // Try to get the first URL
    let href = await page.$eval("div.g", el => el.firstElementChild.href);
    if (!href) {
        href = await page.$eval("div.r", el => el.firstElementChild.href);
    }

    // the next two lines are for "reporting" purposes
    result++;
    console.log(`Found URL: ${href}. Already ran ${result}`);
    
    // Close the page
    await page.close();
    
    // Close the browser
    await browser.close();
    
    // return the URL if found, return null if not found
    return href;
}
```
