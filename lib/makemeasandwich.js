// Require sudo on unix platforms
if(process.platform !== 'win32'){
  if(process.env.USER !== "root"){
    console.log("What? Make it yourself.");
    process.exit();
  }
}

// Require the libraries.
var async =   require('async'),
    $ =       require('jquerygo'),
    prompt =  require('prompt'),
    config =  require('nconf'),
    path =    require('path'),
    fs =      require('fs');

// Function to easily get a configuration or prompt for it...
var get = function(param, value, done) {
  var self = this;

  // Allow them to provide a done function.
  if (typeof value === 'function') {
    done = value;
    value = null;
  }

  // Get the parameter name.
  var paramName = (typeof param === 'string') ? param : param.name;
  if (value) {
    config.set(paramName, value);
  }
  else {
    value = config.get(paramName);
  }

  if (!value) {
    prompt.get([param], function (err, result) {
      value = result[paramName];
      config.set(paramName, value);
      done(null, value);
    });
  }
  else if(done) {
    done(null, value);
  }
  else {
    return value;
  }
};

// Load the configuration from -o first, else default config if exists
config.argv().env();

var configFile = config.get('o');
if (configFile) {
  config.file({file: configFile});
}
else {
  if(process.platform == 'win32'){
    configFile = process.cwd().split(path.sep)[0] + path.sep + 'mmas' + path.sep + 'config.json';
  } else {
    configFile =  path.sep + 'etc' + path.sep + 'mmas' + path.sep + 'config.json';
  }

  fs.exists(configFile, function(exists) {
    if(exists){
      config.file({file:configFile});
    }
  });
}

/**
 * Method to capture and ensure the screenshots directory exists.
 */
var capture = function(fileName) {
  // Return the async function.
  return function(done) {

    // The directory to store the screenshots.
    var dir = __dirname + '/../screenshots';

    // Check that the directory exists.
    fs.exists(dir, function(exists) {
      if (exists) {
        $.capture(dir + '/' + fileName + '.png', done);
      }
      else {
        fs.mkdir(dir, function(err) {
          if (err) return done(err);
          $.capture(dir + '/' + fileName + '.png', done);
        });
      }
    });
  }
}

/**
 * A method to capture the debug name.
 */
var debugCapture = function(fileName) {
  if (config.get('debug')) {
    return capture(fileName);
  }
  return function(done) { done(); }
};

// Start the prompt.
prompt.start();

// Jimmy Johns already has jquery.
$.config.addJQuery = false;

/**
 * Input a value.
 *
 * @param {type} selector
 * @param {type} value
 * @param {type} done
 * @returns {undefined}
 */
var input = function(selector, value, done) {
  $(selector).val(value, function() {
    this.blur(done);
  });
};

/**
 * Helper to set an input within an async series.
 * @param {type} selector
 * @param {type} config
 * @returns {unresolved}
 */
var setInput = function(selector, param, direct) {
  direct = !!direct;
  return function(done) {
    if (direct) {
      input(selector, config.get(param), done);
    }
    else {
      get(param, function(err, value) {
        input(selector, value, done);
      });
    }
  };
};

/**
 * Select a value.
 *
 * @param {type} selector
 * @param {type} value
 * @param {type} done
 * @returns {undefined}
 */
var select = function(selector, value, done) {
  if (value) {
    $(selector + ' li:contains("' + value + '") a:eq(0)').click(function() {
      this.blur(done);
    });
  }
  else {
    done();
  }
};

/**
 * Helper to select a value within an async series.
 * @param {type} selector
 * @param {type} value
 * @returns {unresolved}
 */
var selectVal = function(selector, param, direct) {
  direct = !!direct;
  return function(done) {
    selector += 'SelectBoxItOptions';
    if (direct) {
      var value = config.get(param);
      if (!value) {
        value = param;
      }
      select(selector, value, done);
    }
    else {
      get(param, function(err, value) {
        select(selector, value, done);
      });
    }
  };
};

/**
 * Selects an ingredient.
 *
 * @param {type} param
 * @returns {unresolved}
 */
var selectIngredient = function(param) {
  return function(done) {
    get(param, function(err, value) {
      if (value) {
        var query = 'div.includedIngredientsWrap ';
        query += 'h4:contains("' + param + '") ';
        query += '~ span:contains("' + value + '")';
        $(query).click(function() {
          this.blur(done);
        });
      }
      else {
        done();
      }
    });
  };
};

/**
 * Helper to print something when it is executed.
 *
 * @param {type} text
 * @returns {unresolved}
 */
var print = function(text) {
  return function(done) {
    console.log(text);
    done();
  };
};

/**
 * Helper function to take a pause...
 *
 * @param {type} time
 * @returns {unresolved}
 */
var sleep = function(time) {
  return function(done) {
    setTimeout(done, time);
  };
};

/**
 * Login to Jimmy Johns.
 */
var login = function(done) {
  async.series([
    print('Logging in.'),
    $.go(false, 'visit', 'https://online.jimmyjohns.com/#/login'),
    $.go(false, 'waitForElement', '#email'),
    debugCapture('login1'),
    setInput('#email', 'email'),
    debugCapture('login2'),
    setInput('#loginPassword', {name: 'pass', hidden: true}),
    debugCapture('login3'),
    $('#loginButton').go(false, 'click'),
    $.go(false, 'waitForElement', 'p.welcomeMsg'),
    debugCapture('login4'),
    print('Successfully logged in.'),
    sleep(3000)
  ], done);
};

/**
 * Fill out the new delivery stuff..
 * @param {type} done
 * @returns {undefined}
 */
var newDelivery = function(done) {
  async.series([
    print('Filling out delivery information.'),
    $.go(false, 'visit', 'https://online.jimmyjohns.com/#/deliveryaddress'),
    debugCapture('delivery1'),
    $.go(false, 'waitForElement', '#companyInput'),
    debugCapture('delivery2'),
    setInput('#companyInput', 'company', true),
    debugCapture('delivery3'),
    setInput('#addressInput', 'address'),
    debugCapture('delivery4'),
    setInput('#aptNoInput', 'apt/suite', true),
    debugCapture('delivery5'),
    setInput('#cityInput', 'city'),
    debugCapture('delivery6'),
    selectVal('#stateSelect', 'state'),
    debugCapture('delivery7'),
    setInput('#zip', 'zip'),
    debugCapture('delivery8'),
    sleep(1000),
    $('#verifyAddressBtn').go(false, 'click'),
    $.go(false, 'waitForElement', '#confirmDeliveryAddressBtn'),
    debugCapture('delivery9'),
    sleep(1000),
    $('#confirmDeliveryAddressBtn').go(false, 'click'),
    debugCapture('delivery10'),
    $.go(false, 'waitForElement', 'a.menuTab'),
    debugCapture('delivery11'),
    print('Sucessfully filled out delivery information.'),
  ], done);
};

/**
 * Select your sandwich on the page.
 *
 * @param {type} done
 * @returns {selectSandwich}
 */
var selectSandwich = function(done) {
  console.log('Selecting sandwich.');
  var sandwich = config.get('sandwich');
  if (!sandwich) {
    console.log('No sandwich specified in your config file.');
    done(true);
  }
  else {
    sandwich = sandwich.toLowerCase();
    var found = false, selection = 0, query = 'a.menuItem span.displayName';

    // Iterate over each sandwich.
    $(query).each(function(index, item, done) {
      item.text(function(text) {
        if (text.toLowerCase().indexOf(sandwich) != -1) {
          selection = index;
          found = true;
        }
        done();
      });
    }, function() {
      if (!found) {
        console.log('Could not find your sandwich.');
        done();
      }
      else {

        // Select this sandwich.
        query += ':eq(' + selection + ')';
        console.log('Sandwich found...');
        $(query).click(function() {
          $.waitForElement('*:contains("Customize Your Order")', done);
        });
      }
    });
  }
};

/**
 * Customize your order.
 *
 * @param {type} done
 * @returns {customizeOrder}
 */
var customizeOrder = function(done) {
  async.series([
    print('Customizing order...'),
    sleep(2000),
    $.go(false, 'waitForElement', '#textInput'),
    debugCapture('customize1'),
    setInput('#textInput', 'who'),
    debugCapture('customize2'),
    selectVal('#select_2944', 'bread'),
    debugCapture('customize3'),
    $.go(false, 'waitForElement', 'span:contains("Cut in half")'),
    debugCapture('customize4'),
    function(done) {
      if (config.get('cut')) {
        $('#chk_3894').click(done);
      }
    },
    debugCapture('customize5'),
    selectVal('#select_3963', 'drink'),
    debugCapture('customize6'),
    selectVal('#select_3882', 'chips'),
    debugCapture('customize7'),
    selectVal('#select_3992', 'cookie'),
    debugCapture('customize8'),
    selectVal('#select_3943', 'pickle'),
    debugCapture('customize9'),
    selectIngredient('Tomato'),
    debugCapture('customize10'),
    $('*:contains("Add To Order")').go(false, 'click'),
    $.go(false, 'waitForElement', '*:contains("Your Order For Delivery")'),
    debugCapture('customize11'),
    print('Done customizing order.'),
  ], done);
};

/**
 * Select a credit card.
 *
 * @param {type} done
 * @returns {undefined}
 */
var selectCard = function(done) {
  // Have them chose their credit card.
  console.log("Please select your card type:\n\
  1.) American Express\n\
  2.) Visa\n\
  3.) Mastercard\n\
  4.) Discover Card");
  prompt.get(['card'], function (err, result) {
    switch (result.card) {
      case '1':
        $('a#radio_Amex').click(done);
        break;
      case '2':
        $('a#radio_Visa').click(done);
        break;
      case '3':
        $('a#radio_Mastercard').click(done);
        break;
      case '4':
        $('a#radio_Discover').click(done);
        break;
      default:
        done(true);
        break;
    }
  });
};

/**
 * Enter their card number.
 *
 * @param {type} done
 * @returns {undefined}
 */
var enterCardNumber = function(done) {
  console.log("Enter your card number:");
  prompt.get(['cardnum'], function(err, result) {
    input('#cardNumber', result.cardnum, done);
  });
};

/**
 * Enter the card expiration date.
 *
 * @param {type} done
 * @returns {undefined}
 */
var enterCardExpire = function(done) {
  console.log("Enter the card expiration: Format MM-YY:");
  prompt.get(['expire'], function(err, result) {
    var parts = result.expire.split('-');
    select('#expMonthSelectBoxItOptions', parts[0], function() {
      select('#expYearSelectBoxItOptions', '20' + parts[1], done);
    });
  });
};

/**
 * Enter the card code.
 *
 * @param {type} done
 * @returns {undefined}
 */
var enterCardCode = function(done) {
  console.log("Enter the card security code (on back):");
  prompt.get(['code'], function(err, result) {
    input('#securityCode', result.code, done);
  });
};

/**
 * Enter the name on the card.
 *
 * @param {type} done
 * @returns {undefined}
 */
var enterCardName = function(done) {
  console.log("Enter the name on the card:");
  prompt.get(['name'], function(err, result) {
    input('#nameOnCard', result.name, done);
  });
};

/**
 * Now checkout...
 * @param {type} done
 * @returns {undefined}
 */
var checkout = function(done) {
  async.series([
    print('Checking out...'),
    $.go(false, 'waitForElement', 'a#gotoCheckoutBtn'),
    debugCapture('checkout1'),
    $('a#gotoCheckoutBtn').go(false, 'click'),
    $.go(false, 'waitForElement', '#selectPaymentType'),
    debugCapture('checkout2'),
    selectVal('#selectPaymentType', 'Credit Card', true),
    $.go(false, 'waitForElement', 'div#cards'),
    debugCapture('checkout3'),
    selectCard,
    debugCapture('checkout4'),
    selectVal('#selectPaymentType', 'Credit Card', true),
    debugCapture('checkout5'),
    enterCardNumber,
    debugCapture('checkout6'),
    enterCardExpire,
    debugCapture('checkout7'),
    enterCardCode,
    debugCapture('checkout8'),
    enterCardName,
    debugCapture('checkout9'),
    setInput('#tipAmount', 'tip'),
    debugCapture('checkout10'),
    setInput('#billingAddress', 'billing_address'),
    debugCapture('checkout11'),
    setInput('#billingCity', 'billing_city'),
    debugCapture('checkout12'),
    selectVal('#stateSelect', 'billing_state'),
    debugCapture('checkout13'),
    setInput('#billingZip', 'billing_zip'),
    debugCapture('checkout14'),
    $('*:contains("Review Order")').go(false, 'click'),
    $.go(false, 'waitForElement', '*:contains("Review & Place Order")'),
    debugCapture('checkout15'),
    setInput('#companyInput', 'company', true),
    debugCapture('checkout16'),
    setInput('#aptNoInput', 'apt/suite', true),
    debugCapture('checkout17'),
    setInput('#gateCode', 'gate_code', true),
    debugCapture('checkout18'),
    setInput('#deliveryInstructions', 'delivery_instructions', true),
    sleep(1000),
    debugCapture('checkout19'),
    print('Placing order...'),
    $('*:contains("Place Order")').go(false, 'click'),
    $.go(false, 'waitForElement', '*:contains("Thank you for your order")'),
    capture('complete'),
    print('Delivery on its way! Order details at ' + __dirname + '/../screenshots/complete.png')
  ], done);
};

// Order a sandwich!!!
async.series([
  login,
  newDelivery,
  selectSandwich,
  customizeOrder,
  checkout
], function() {
  $.close();
});
