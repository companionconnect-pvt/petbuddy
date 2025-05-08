const SibApiV3Sdk = require('sib-api-v3-sdk');
let defaultClient = SibApiV3Sdk.ApiClient.instance;

let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY

async function userSignup(data) {
    try {
      let apiInstance = new SibApiV3Sdk.ContactsApi();

      let createContact = new SibApiV3Sdk.CreateContact();
      
      createContact.email = data.email;
      createContact.attributes = {'FIRSTNAME' : data.name, 'SMS':`+91${data.phoneNumber}`};
      createContact.ext_id = data._id;
      createContact.listIds = [6]
      
      const res = await apiInstance.createContact(createContact).then(function(data) {
        console.log('API called successfully. Returned data: ' + JSON.stringify(data));
      }, function(error) {
        console.error(error);
      });
      return 1;
    } catch (error) {
      console.error("Error creating contact: ", error);
      throw error;
    }
}

async function sendNewUserMail(data) {
  try {
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail = {
      to: [{
        email: data.email,
        name: data.name,
      }],
      templateId: 3,
      params: {
        FIRSTNAME: data.name,
      },
      headers: {
        accept: 'application/json',
        'content-type':'application/json',
        'api-key':process.env.BREVO_API_KEY
      }
    };
    
    const res = await apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
      console.log('API called successfully. Returned data:');
    }, function(error) {
      console.error(error);
    });
  } catch (error) {
    console.error("Error Sending the mail: ", error);
      throw error;
  }
}

async function updateUserData(data) {
  try {
    let apiInstance = new SibApiV3Sdk.ContactsApi();

  let identifier = data._id; 

  let updateContact = new SibApiV3Sdk.UpdateContact(); 

  updateContact.attributes = {'EMAIL':data.email,'FIRSTNAME':data.name, 'SMS':data.phoneNumber};

  const res = await apiInstance.updateContact(identifier, updateContact).then(function() {
  console.log('API called successfully.');
}, function(error) {
  console.error(error);
});
  }catch (error) {
    console.error("Error updating user data: ", error);
    throw error;
  }
}

async function sendConsultationConfirmation(data) {
  try {
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail = {
      to: [{
        email: data.email,
        name: data.userName,
      }],
      templateId: 4,
      params: {
        FIRSTNAME: data.userName,
        PETNAME: data.petName,
        DATE: data.date,
        TIME: data.time,
        MODE: data.mode,
      },
      headers: {
        accept: 'application/json',
        'content-type':'application/json',
        'api-key':process.env.BREVO_API_KEY
      }
    };
    
    const res = await apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
      console.log('API called successfully. Returned data:');
    }, function(error) {
      console.error(error);
    });
  } catch(error) {
    console.error("Error sending mail: ", error);
    throw error;
  }
}

async function sendBookingConfirmation(data) {
  try {
    var apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    var sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail = {
      to: [{
        email: data.email,
        name: data.userName,
      }],
      templateId: 5,
      params: {
        FIRSTNAME: data.userName,
        PETNAME: data.petName,
        STARTDATE: data.startDate,
        ENDDATE: data.endDate,
        SERVICE: data.service,
      },
      headers: {
        accept: 'application/json',
        'content-type':'application/json',
        'api-key':process.env.BREVO_API_KEY
      }
    };
    
    const res = await apiInstance.sendTransacEmail(sendSmtpEmail).then(function(data) {
      console.log('API called successfully. Returned data:', data.service);
    }, function(error) {
      console.error(error);
    });
  } catch(error) {
    console.error("Error sending mail: ", error);
    throw error;
  }
}

module.exports = { userSignup, sendNewUserMail, updateUserData, sendBookingConfirmation, sendConsultationConfirmation };
