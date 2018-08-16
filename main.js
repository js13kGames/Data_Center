var shopDiv = document.getElementById("shop")
var rackDiv = document.getElementById("rack")

var rackSpace = 4
var selectedPort = null

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
    "PS-0",
    "ROUTER",
    "SW-4",
    "SR-200",
]

var cables = [
    [[0, 0], [1, 18]],
    [[0, 1], [2, 18]],
    [[0, 2], [3, 18]],
    [[1, 0], [2, 17]],
    [[2, 0], [3, 17]],
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

    for (var m = 0; m < rack.length; m++) {
        const name = rack[m]
        var machine = machines[name]
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
        nameDiv.innerHTML = name
        machineDiv.appendChild(nameDiv)
        for (var j = 0; j < portLayout.length; j++) {
            const port = portLayout[j]
            if (port === "") {
                machineDiv.appendChild(document.createElement("div"))
                continue
            }

            var portDiv = document.createElement("div")
            portDiv.classList.add(port, "port")
            const machineNumber = m
            const portNumber = j

            var holeDiv = document.createElement("div")
            holeDiv.className = "hole"
            portDiv.appendChild(holeDiv)
            machineDiv.appendChild(portDiv)

            holeDiv.onclick = () => clickPort(machineNumber, portNumber)
        }
        rackDiv.appendChild(machineDiv)
    }
}

function clickPort(machineIndex, portIndex) {
    if (selectedPort === null) {
        selectedPort = [machineIndex, portIndex]
        getPortHoleDiv(machineIndex, portIndex).classList.add("selected")
        return
    }

    var selectedType = getPortDiv(selectedPort[0], selectedPort[1]).classList[0]
    var clickedType = getPortDiv(machineIndex, portIndex).classList[0]

    if (selectedPort[0] === machineIndex) {
        alert("Why would you even want to connect a machine to itself?")
        getPortHoleDiv(selectedPort[0], selectedPort[1]).classList.remove("selected")
        selectedPort = null
        return
    }

    if (selectedType !== clickedType) {
        alert("Can only connect ports of the same type")
        getPortHoleDiv(selectedPort[0], selectedPort[1]).classList.remove("selected")
        selectedPort = null
        return
    }

    cables.push([selectedPort, [machineIndex, portIndex]])
    renderCables()
    getPortHoleDiv(selectedPort[0], selectedPort[1]).classList.remove("selected")
    selectedPort = null
}

function getPortDiv(machineIndex, portIndex) {
    return document.getElementById("rack").children[machineIndex].children[portIndex+1]
}

function getPortHoleDiv(machineIndex, portIndex) {
    return getPortDiv(machineIndex, portIndex).children[0]
}

function renderCables() {
    document.getElementById("cables").innerHTML = ""
    for (var cable of cables) {
        var from = cable[0]
        var to = cable[1]

        var fromHole = getPortHoleDiv(from[0], from[1])
        var toHole = getPortHoleDiv(to[0], to[1])

        connect(fromHole, toHole)
    }
}

/* COMPLETE HACK DO NOT TOUCH */
function connect(div1, div2) {
    var off1 = getOffset(div1)
    var off2 = getOffset(div2)
    var x1 = off1.left + off1.width/2 - 200 /* WHY DOES IT HAVE TO BE THESE NUMBERS??? */
    var y1 = off1.top + off1.height/2 - 92
    var x2 = off2.left + off2.width/2 - 200
    var y2 = off2.top + off2.height/2 - 92
    var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)))
    var cx = ((x1 + x2) / 2) - (length / 2)
    var cy = ((y1 + y2) / 2) - 3
    var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI)
    var htmlLine = "<div style='padding:0px; margin:0px; height:" + 6 + "px; line-height:1px; position:absolute; left:" + cx + "px; top:" + cy + "px; width:" + length + "px; -moz-transform:rotate(" + angle + "deg); -webkit-transform:rotate(" + angle + "deg); -o-transform:rotate(" + angle + "deg); -ms-transform:rotate(" + angle + "deg); transform:rotate(" + angle + "deg);' />"
    document.getElementById("cables").innerHTML += htmlLine;
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
    renderCables()
}

restock()
render()