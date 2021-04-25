module.exports = {
  getProfessionalEmailScore: (email, firstName, lastName) => {
    let tempEmail = email.toLowerCase().split("@")[0];
    let first = firstName.toLowerCase();
    let last = lastName.toLowerCase();
    const emailTemplates = [
      first,
      last,
      first + last,
      last + first,
      first + "." + last,
      last + "." + first,
      first + "-" + last,
      last + "-" + first,
      first + "_" + last,
      last + "_" + first,
    ];
    // console.log(tempEmail, emailTemplates);
    // if (emailTemplates.filter((item) => item.indexOf(email) > -1)) return 100;
    tempEmail = tempEmail.replace(first, "").replace(last, "");
    if ((tempEmail.length <= 1 && (tempEmail == "_") || tempEmail == ".")) {
      return 100;
    }
    if (tempEmail.length < 3) {
      return 75;
    }
    if (tempEmail.length < 4) {
      return 50;
    }
    if (tempEmail.length < 6) {
      return 25;
    }
    return 0;
  },
};
