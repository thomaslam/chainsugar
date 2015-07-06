var User = require('../db').User;
var Stripe = require('stripe')('sk_test_aBAZwgWesuLzaiwvZRoDYy6X');

module.exports = function(app) {
  app.post('/charge', function(req, res) {
    var stripeOwner = req.body.stripeOwner;
    var stripeDebtor = req.body.stripeDebtor;
    var amount = parseInt(req.body.amount) * 100; // must be in cents

    console.log(stripeOwner);
    console.log(stripeDebtor);
    
    if (req.isAuthenticated()) {
      User.findById(stripeOwner._id)
        .exec(function(err, user) {
          if (err) {
            return res.send(500).end();
          }

          if (user) {
            user.stripeid.balance -= amount;

            user.save(function(err) {
              if (err) {
                return res.status(500).end();
              }
              res.status(201).end();
            })
          } else {
            return res.status(404).end();
          }
        })
        .then(function(promise) {
          // how to add amount to card?
          User.findById(stripeDebtor._id)
            .exec(function(err, user) {
              if (err) {
                return res.send(500).end();
              }

              if (user) {
                user.stripeid.balance += amount;

                user.save(function(err) {
                  if (err) {
                    return res.status(500).end();
                  }
                  res.status(201).end();
                })
              } else {
                return res.status(404).end();
              }
            });
        })

    }

  })
}