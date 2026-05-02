const axios = require('axios');
require('dotenv').config();

// API
const URL = "http://20.207.122.201/evaluation-service/notifications";

// Token
const TOKEN = process.env.ACCESS_TOKEN;

// Headers
const headers = {
    Authorization: `Bearer ${TOKEN}`
};


function getPriorityScore(n) {
    let weight = 0;

    if (n.Type === "Placement") weight = 3;
    else if (n.Type === "Result") weight = 2;
    else weight = 1;

    const time = new Date(n.Timestamp).getTime();

    return weight * 1e13 + time;
}


class PriorityInbox {
    constructor(maxSize = 10) {
        this.heap = [];
        this.maxSize = maxSize;
    }

    add(n) {
        if (this.heap.length < this.maxSize) {
            this.heap.push(n);
            this.bubbleUp(this.heap.length - 1);
        } else {
            if (getPriorityScore(n) > getPriorityScore(this.heap[0])) {
                this.heap[0] = n;
                this.bubbleDown(0);
            }
        }
    }

    getTop() {
        return this.heap.sort((a, b) => getPriorityScore(b) - getPriorityScore(a));
    }

    bubbleUp(i) {
        while (i > 0) {
            let p = Math.floor((i - 1) / 2);
            if (getPriorityScore(this.heap[p]) <= getPriorityScore(this.heap[i])) break;

            [this.heap[p], this.heap[i]] = [this.heap[i], this.heap[p]];
            i = p;
        }
    }

    bubbleDown(i) {
        let n = this.heap.length;

        while (true) {
            let l = 2 * i + 1;
            let r = 2 * i + 2;
            let smallest = i;

            if (l < n && getPriorityScore(this.heap[l]) < getPriorityScore(this.heap[smallest])) {
                smallest = l;
            }

            if (r < n && getPriorityScore(this.heap[r]) < getPriorityScore(this.heap[smallest])) {
                smallest = r;
            }

            if (smallest === i) break;

            [this.heap[i], this.heap[smallest]] = [this.heap[smallest], this.heap[i]];
            i = smallest;
        }
    }
}


async function run() {
    try {
        const res = await axios.get(URL, { headers });

        const notifications = res.data.notifications;

        const inbox = new PriorityInbox(10);

        notifications.forEach(n => inbox.add(n));

        const top10 = inbox.getTop();

        
        const result = {
            count: top10.length,
            notifications: top10.map(n => ({
                ID: n.ID,
                Type: n.Type,
                Message: n.Message,
                Timestamp: n.Timestamp
            }))
        };

        // ✅ PRINT JSON
        console.log(JSON.stringify(result, null, 2));

    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}

// run
run();