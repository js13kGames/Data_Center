var shopDiv = document.getElementById("shop")
var rackDiv = document.getElementById("rack")

var rackSpace = 4

window.setInterval(() => {
    restock()
    renderShop()
}, 1000 * 30)

var machines = {
    "SR-200": {
        type: "server",
        price: 180,
        power: 180,
        clock: 2.1,
        cores: 4,
        ram: 8,
        storage: {
            drives: 1,
            capacity: 256,
        },
    },
    "SR-300": {
        type: "server",
        price: 480,
        power: 350,
        clock: 2.5,
        cores: 8,
        ram: 16,
        storage: {
            drives: 4,
            capacity: 512,
        },
    },

    "SW-4": {
        type: "switch",
        price: 50,
        power: 40,
        ports: 4,
    },
    "SW-16": {
        type: "switch",
        price: 130,
        power: 90,
        ports: 16,
    },

    "PS-0": {
        type: "psu",
        price: 40,
        power: 250,
        ports: 6,
    },

    "ROUTER": {
        type: "router",
        price: 0,
        power: 0,
        ports: 8,
    }

    // Possible other machines: monitor, storage, tpu, crypto-miner, ups
    // Also, add more stats to servers -- gpu, cpu cache, disk r/w speed, network interface
}

var maxStock = {
    "SR-200": 5,
    "SR-300": 2,
    "SW-4": 3,
    "SW-16": 2,
    "PS-0": 2,
}

var shopStock = {}

var rack = [
    {
        name: "PS-0",
        ports: [],
    },
    {
        name: "ROUTER",
        ports: [],
    },
    {
        name: "SW-4",
        ports: [],
    },
    {
        name: "SR-200",
        ports: [],
    }
]

function restock() {
    for (const name in maxStock) {
        if (maxStock.hasOwnProperty(name)) {
            if (!shopStock.hasOwnProperty(name)) {
                shopStock[name] = 0
            }
            if (shopStock[name] < maxStock[name]) {
                shopStock[name]++
            }
        }
    }
}

function renderShop() {
    shopDiv.innerHTML = ""

    for (const name in shopStock) {
        if (shopStock.hasOwnProperty(name)) {
            machine = machines[name]
            title = `${name}, ${shopStock[name]} left, £${machine.price}`
            lines = []
            switch (machine.type) {
            case "server":
                lines = [
                    `${machine.power}W`,
                    `${machine.cores}-core ${machine.clock}Ghz`,
                    `${machine.ram}GB RAM`,
                    `${machine.storage.drives}x ${machine.storage.capacity}GB storage`,
                ]
                break
            case "switch":
                lines = [
                    `${machine.power}W`,
                    `${machine.ports} ethernet ports`,
                ]
                break
            case "psu":
                lines = [
                    `supplies ${machine.power}W on each port`,
                    `${machine.ports} ports`,
                ]
                break
            }
            elem = document.createElement("div")
            elem.className = "shop-item"
            titleElem = document.createElement("h1")
            titleElem.innerHTML = title
            elem.appendChild(titleElem)
            lines.forEach(line => {
                pelem = document.createElement("p")
                pelem.innerHTML = line
                elem.appendChild(pelem)
            })
            shopDiv.appendChild(elem)
        }
    }
}

function renderRack() {
    rackDiv.innerHTML = ""

    for (const item of rack) {
        var machine = machines[item.name]
        var portLayout = ["", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "", "power"]
        switch (machine.type) {
        case "server":
            portLayout[17] = "net"
            break
        case "switch":
            for (var i = 0; i < machine.ports; i++) {
                portLayout[i] = "net"
            }
            portLayout[17] = "net"
            break
        case "psu":
            portLayout[18] = ""
            for (var i = 0; i < machine.ports; i++) {
                portLayout[i] = "power"
            }
            break
        case "router":
            for (var i = 0; i < machine.ports; i++) {
                portLayout[i] = "net"
            }
            break
        }
        var machineDiv = document.createElement("div")
        machineDiv.classList.add("machine", machine.type)
        var nameDiv = document.createElement("div")
        nameDiv.className = "name"
        nameDiv.innerHTML = item.name
        machineDiv.appendChild(nameDiv)
        for (const port of portLayout) {
            if (port === "") {
                machineDiv.appendChild(document.createElement("div"))
                continue
            }
            var portDiv = document.createElement("div")
            portDiv.classList.add(port, "port")
            var holeDiv = document.createElement("div")
            holeDiv.className = "hole"
            portDiv.appendChild(holeDiv)
            machineDiv.appendChild(portDiv)
        }
        rackDiv.appendChild(machineDiv)
    }
}

function connect(div1, div2, color, thickness) {
    var off1 = getOffset(div1)
    var off2 = getOffset(div2)
    var x1 = off1.left + off1.width/2 - 200
    var y1 = off1.top + off1.height/2 - 92
    var x2 = off2.left + off2.width/2 - 200
    var y2 = off2.top + off2.height/2 - 92
    var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)))
    var cx = ((x1 + x2) / 2) - (length / 2)
    var cy = ((y1 + y2) / 2) - (thickness / 2)
    var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI)
    var htmlLine = "<div style='padding:0px; margin:0px; height:" + thickness + "px; background-color:" + color + "; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />"
    document.body.innerHTML += htmlLine;
}

function getOffset(el) {
    var rect = el.getBoundingClientRect()
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + window.pageYOffset,
        width: rect.width || el.offsetWidth,
        height: rect.height || el.offsetHeight
    }
}

function render() {
    renderShop()
    renderRack()
}

restock()
render()