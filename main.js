var shopDiv = document.getElementById("shop")
var rackDiv = document.getElementById("rack")

var rackSpace = 4
var selectedPort = null
var balance = 500
var traffic = 0
var trafficHistory = [0]
var uptime = 0
var secondsPerDay = 60
var trafficCap = 0

window.setInterval(elapseDay, 1000 * secondsPerDay)
window.setInterval(elapseHour, (1000 * secondsPerDay)/24)

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
        ports: 4,
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

var cables = []

function elapseHour() {
    uptime++
    moneyGained = traffic / (48 + (Math.random() - 0.5) * 8)
    balance += moneyGained
    document.getElementById("cash-per-hour").innerHTML = moneyGained.toFixed(2)
    traffic = Math.min(
        Math.round((traffic + Math.round(Math.random() * 2.5)) * (Math.random() * 0.15 + 0.9)),
        calculateTrafficCap(),
    )
    trafficHistory.unshift(traffic)
    if (trafficHistory.length > 128) {
        trafficHistory.pop()
    }
    renderStats()
    renderGraph()
}

function elapseDay() {
    restock()
    render()
}

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

function calculateTrafficCap() {
    var cores = 0
    var ram = 0

    rack.forEach((name, index) => {
        var machine = machines[name]
        if (machine.type === "server" && machineIsConnected("power", index) && machineIsConnected("net", index)) {
            cores += machine.cores
            ram += machine.ram
        }
    })

    return cores*50 + ram*8
}

function buyMachine(name) {
    var machine = machines[name]
    if (machine.price > balance) {
        alert(`You need ${machine.price} to buy a ${name}, but you only have ${balance}`)
        return
    }

    if (shopStock[name] <= 0) {
        alert(`There are no ${name}s left in stock. New stock arrives every day`)
        return
    }

    shopStock[name]--
    balance -= machine.price
    rack.push(name)
    render()
}

function renderShop() {
    shopDiv.innerHTML = ""

    for (const name in shopStock) {
        if (shopStock.hasOwnProperty(name)) {
            machine = machines[name]
            title = `${name}, ${shopStock[name]} left`
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
            var buy = document.createElement("button")
            buy.innerHTML = `buy for £${machine.price}`
            const machineName = name
            buy.onclick = () => buyMachine(machineName)
            elem.appendChild(buy)
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
        var portLayout = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], [], ["power", "in"]]
        switch (machine.type) {
        case "server":
            portLayout[17] = ["net", "in"]
            break
        case "switch":
            for (var i = 0; i < machine.ports; i++) {
                portLayout[i] = ["net", "out"]
            }
            portLayout[17] = ["net", "in"]
            break
        case "psu":
            portLayout[18] = ""
            for (var i = 0; i < machine.ports; i++) {
                portLayout[18-i-1] = ["power", "out"]
            }
            break
        case "router":
            for (var i = 0; i < machine.ports; i++) {
                portLayout[i] = ["net", "out"]
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
            if (port.length === 0) {
                machineDiv.appendChild(document.createElement("div"))
                continue
            }

            var portDiv = document.createElement("div")
            portDiv.classList.add(...port, "port")
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

function renderStats() {
    document.getElementById("balance").innerHTML = balance.toFixed(2)
    document.getElementById("traffic").innerHTML = traffic
    document.getElementById("uptime").innerHTML = (uptime / 24).toFixed(1)
    document.getElementById("traffic-cap").innerHTML = calculateTrafficCap()
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

    if (portIsConnected(selectedPort) || portIsConnected([machineIndex, portIndex])) {
        alert("Only one cable can be attached to a port!")
        getPortHoleDiv(selectedPort[0], selectedPort[1]).classList.remove("selected")
        selectedPort = null
        return
    }

    cables.push([selectedPort, [machineIndex, portIndex]])
    renderCables()
    renderStats()
    getPortHoleDiv(selectedPort[0], selectedPort[1]).classList.remove("selected")
    selectedPort = null
}

function portIsConnected(port) {
    return getConnectedCable(port) !== null
}

// first element of cable is always the port
function getConnectedCable(port) {
    function eq(a, b) {
        return a[0] == b[0] && a[1] == b[1]
    }

    for (var cable of cables) {
        if (eq(cable[0], port)) {
            return cable
        }
        if (eq(cable[1], port)) {
            // we need to flip the cable round
            return [cable[1], cable[0]]
        }
    }

    return null
}

// kind is "power" or "net"
// index is the machine index in the rack
function machineIsConnected(kind, index, checked=[]) {
    if (checked.indexOf(index) >= 0) {
        return false
    }

    var machine = machines[rack[index]]

    var inputIndex = inputPortIndex(kind, machine.type)
    if (machine.type == "psu") {
        return kind == "power"
    } else if (machine.type == "router" && kind == "net") {
        return machineIsConnected("power", index)
    }

    var cable = getConnectedCable([index, inputIndex])
    if (cable === null) {
        return false
    }

    return machineIsConnected(kind, cable[1][0], Array.concat(checked, [index]))
}

// type is the type of a machine, such as "server"
function inputPortIndex(port, type) {
    switch (type) {
    case "server":
    case "switch":
        return port == "net" ? 17 : 18
    case "router":
        return port == "net" ? null : 18 // no net input
    case "psu":
        return null // no inputs
    }
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

function renderGraph() {
    var canvas = document.getElementById("graph")
    var ctx = canvas.getContext("2d")
    canvas.width = canvas.width

    var x = canvas.width
    var max = Math.max(...trafficHistory)
    if (max == 0) {
        return
    }

    ctx.fillStyle = "lime"
    for (var t of trafficHistory) {
        var height = (t/max) * canvas.height * 0.9
        x -= 3
        ctx.fillRect(x, canvas.height, 2, -height)
    }
}

function connect(div1, div2) {
    var off1 = getOffset(div1)
    var off2 = getOffset(div2)
    var x1 = off1.left + off1.width/2
    var y1 = off1.top + off1.height/2
    var x2 = off2.left + off2.width/2
    var y2 = off2.top + off2.height/2
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
    renderStats()
}

elapseDay()
