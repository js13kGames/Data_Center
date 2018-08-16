var rackSpace = 4

var machines = {
    "SR-200": {
        "type": "server",
        "price": 180,
        "power": 180,
        "clock": 2.1,
        "cores": 4,
        "ram": 8,
        "storage": {
            "drives": 1,
            "capacity": 256,
        },
    },
    "SR-210": {
        "type": "server",
        "price": 370,
        "power": 230,
        "clock": 2.9,
        "cores": 6,
        "ram": 12,
        "storage": {
            "drives": 2,
            "capacity": 1024,
        },
    },
    "SR-300": {
        "type": "server",
        "price": 480,
        "power": 350,
        "clock": 2.5,
        "cores": 8,
        "ram": 16,
        "storage": {
            "drives": 2,
            "capacity": 512,
        },
    },
    "SR-600": {
        "type": "server",
        "price": 920,
        "power": 460,
        "clock": 2.6,
        "cores": 16,
        "ram": 32,
        "storage": {
            "drives": 4,
            "capacity": 1024,
        },
    },

    "SW-2": {
        "type": "switch",
        "price": 30,
        "power": 20,
        "ports": 2,
    },
    "SW-4": {
        "type": "switch",
        "price": 50,
        "power": 40,
        "ports": 4,
    },
    "SW-8": {
        "type": "switch",
        "price": 80,
        "power": 60,
        "ports": 8,
    },
    "SW-16": {
        "type": "switch",
        "price": 130,
        "power": 90,
        "ports": 16,
    },

    "PS-0": {
        "type": "psu",
        "price": 40,
        "power": 250,
    },
    "PS-1": {
        "type": "psu",
        "price": 85,
        "power": 600,
    }

    // Possible other machines: monitor, storage, tpu, crypto-miner, ups
    // Also, add more stats to servers -- gpu, cpu cache, disk r/w speed, network interface
}

var maxStock = {
    "SR-200": 5,
    "SR-210": 3,
    "SR-300": 2,
    "SR-600": 1,
    "SW-2": 4,
    "SW-4": 3,
    "SW-8": 2,
    "SW-16": 2,
    "PS-0": 2,
    "PS-1": 2,
}

var shopStock = {}

var rack = [
    {
        "name": "SW-8",
        "ports": [],
    },
    {
        "name": "PS-0",
        "ports": [],
    },
    {
        "name": "SR-200",
        "ports": [],
    }
]

function restock() {
    for (const name in maxStock) {
        if (maxStock.hasOwnProperty(name)) {
            shopStock[name] = maxStock[name]
        }
    }
}