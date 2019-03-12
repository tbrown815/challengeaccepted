#   Challenge Accepted

##  About:

I created this project for my NodeJS project while enrolled at Thinkful.
The application is a basic tool to track different activities.  Current activities that a user can record are steps/distance and run/walk.
    
*   Users can create new accounts.  Creating a new account will require a user's first and last names, their e-mail, and selection of a username and password.

    ![Alt](/readme/createUser.png "Create User screenshot")

*   Returning users can login by providing their username and password.
    *   During login a JWT is created and saved to the browser session storage.  It is used to authenticate access to various endpoints required to retrieve and save data.

    ![Alt](/readme/loginPage.png "Login Page screenshot")

*   Users can view and record new activities on the user dashboard.
    *   The dashboard displays a user's recorded lifetime Steps and Distance.
    *   The dashboard allows users to enter new activity data.  Lifetime steps and distance are updated upon creation.
    *   The dashboard displays up to 10 of the user's most recent activities.

    ![Alt](/readme/userDashboard.png "User Dashboard screenshot")

*   The list of recent activities presents the user with an 'edit' link.  This allows the user to update existing activity stats.  Lifetime steps and distance are updated upon saving.

    ![Alt](/readme/updateStats.png "Edit activity screenshot")

*   The list of recent activities also presents the user with a 'delete' link.  This allows the user to remove existing activity stats.  Lifetime steps and distance are updated upon delete.

    ![Alt](/readme/deleteStat.png "Delete activity screenshot")




##  Technology used:

*   bcryptjs
*   Chai/Chai-http
*   CSS
*   Express.js
*   Faker
*   Git/GitHub
*   Heroku
*   HTML
*   JavaScript
*   JSON Web Token
*   jQuery
*   mLab
*   Mocha
*   Mongo DB
*   Mongoose
*   Node.js
*   Passport.js
*   Postman
*   Travis CI


## API Documentation
*   https://documenter.getpostman.com/view/4606197/RWTrNGAt


##  Access and testing:

Users can access the application at the below URL:

*   https://mysterious-forest-20103.herokuapp.com/

Users can create new users from the login screen or use an existing test user below:

**Test Usernames:**

*   rickitywreck
*   zelmaott18
*   therealmort22
*   spastastic

**Password for existing test users:**
*   test1099





