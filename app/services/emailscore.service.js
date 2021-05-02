module.exports = {
  getProfessionalEmailScore: (email, firstName, lastName, withMessage) => {
    let tempEmail = email.toLowerCase().split("@")[0];
    console.log(tempEmail);
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
    if (
      tempEmail.length == 0 ||
      (tempEmail.length <= 1 && (tempEmail == "_" || tempEmail == "."))
    ) {
      return withMessage ? { message: "No changes needed!", score: 100 } : 100;
    }
    if (tempEmail.length < 3) {
      return withMessage
        ? {
            message:
              "Minor changes. Can you remove these characters? ==>'" +
              tempEmail +
              "'",
            score: 75,
          }
        : 75;
    }
    if (tempEmail.length < 4) {
      return withMessage
        ? {
            message: "Can you remove these characters? ==>'" + tempEmail + "'",
            score: 50,
          }
        : 50;
    }
    if (tempEmail.length < 6) {
      return withMessage
        ? {
            message:
              "These extra characters makes it difficult to remember. Can you remove these characters? ==>'" +
              tempEmail +
              "'",
            score: 25,
          }
        : 25;
    }
    return withMessage
      ? {
          message: "Lots of unwanted characters! A new one might be needed!",
          score: 0,
        }
      : 0;
  },
};
