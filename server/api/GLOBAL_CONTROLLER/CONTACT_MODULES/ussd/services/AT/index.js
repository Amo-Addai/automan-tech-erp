new Vue({
  el: "#root",
  data: {
    title: "Meltwater Food Orders",
    orders: [{
        name: "Eugene Musebe",
        description: "Nyama Choma",
        address: "East Legon",
        telephone: "0501693338",
        open: true
      },
      {
        name: "Funsho Olaniyi",
        description: "Rice and Chicken",
        address: "Sand City",
        telephone: "050169434356",
        open: true
      }
    ]
  },
  created() {
    const pusher = new Pusher('f1c23ec638a1cdc02165', {
      cluster: 'ap2',
      encrypted: true
    })
    const channel = pusher.subscribe('orders')
    channel.bind('customerOrder', (data) => {
      console.log(data)
      this.orders.push(data)
    })
  },
  methods: {
    // close completed order
    close(orderToClose) {
      if (confirm('Are you sure you want to close the order?') === true) {
        this.orders = this.orders.map(order => {
          if (order.name !== orderToClose.name && order.description !== orderToClose.description) {
            return order;
          }
          const change = {
            open: !order.open
          }
          return change;
        })
      }
    }
  }
})