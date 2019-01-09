# Determine New Authentication System

## Context

The Open Apparel Registry application currently uses [Firebase][firebase-auth]
for user authentication. New users sign up using a form in the React client,
which creates a record for the user in Firebase. Firebase in turn generates an
ID for each user, which is then used as a unique source identifier `uid` which
the legacy OAR API connects with uploaded facility data. The legacy API also
collates the `uid` with an API key via a `keySchema` and `keyController` for
the apparent aim of enabling users to create a user-specific API key to use
for communicating with the API directly.

For a variety of reasons we've decided to replace Firebase auth with a new
authentication system. Previously, we decided to replace the legacy API --
which is written in NodeJS, Restify, and MongoDB -- with a new API written
in Python 3, Django REST Framework, and PostGIS.

This change would compel us to rewrite the API's authentication and
key-generating mechanisms entirely, even if we were going to keep Firebase.
However, since neither Civic Apps nor Operations have much experience using
Firebase in a production system, we've decided to replace rather than adapt it.

This ADR explains our choice between two authentication options to replace
Firebase:

- [django-rest-auth][django-rest-auth]
- [Auth0][auth0]

Ultimately, it recommends that we use django-rest-auth.

### Django Rest Framework + Django Rest Auth

To complement Django REST Framework, django-rest-auth adds a standardized set
of URLs, endpoints, and operations to simplify using single page apps with
Django's User models. [django-rest-auth][django-rest-auth-intro]'s
documentation enumerates the following features:

> - User Registration with activation
> - Login/Logout
> - Retrieve/Update the Django User model
> - Password change
> - Password reset via e-mail
> - Social Media authentication

Civic Apps has previously used django-rest-auth for PWD Stormdrain Marking and
PWD Stormwater Connect (also known as GARP), each of which had a similar stack:
a React single page application talking to a Django REST Framework API. Other
Azavea development teams have also used django-rest-auth for projects with
similar stacks: the Temperate project, for instance, uses django-rest-auth with
an Angular SPA.

#### Pros

##### Familiarity

Since we've used django-rest-auth before, we're familiar with the library. In
GARP we used it to implement registration, account activation, password reset,
and other features. Ideally this would mean we won't have to spend much time
poring through django-rest-auth documentation and source code in order to set
it up.

##### Django User Model & Token Authentication

django-rest-auth makes use of the Django User model, which we also have
experience using in Model My Watershed and OpenTreeMap. Having this model also
enables considering using [DRF token authentication][drf-token-auth] for
generating API keys.

The Django User model also enables us to configure permission classes in Python
code -- rather than elsewhere.

##### Django Admin

Since django-rest-auth works on top of Django's User model, it enables us to
make Django Admin available for administrative tasks related to users. We
anticipate that there will be mutiple (e.g. 5+) different types of user; the
Django Admin site offers a way to do user management via a web GUI without
having to create one in React or having to use a third-party dashboard.

#### Cons

##### Email

In the legacy OAR API, confirmation and password reset emails are handled
entirely by Firebase. Handling them via django-rest-auth will compel us to set
up an email backend, likely Amazon SES.

(Note, however, that we are likely already configuring this for other needs
of the application.)

##### UI Boilerplate

Using django-rest-auth for GARP seemed to entail writing a lot of boilerplate
code. In general it seems like the Django/Python code footprint wasn't too
large, but we did have to write a lot of React code related to sign-up, login,
and password reset forms, along with associated Redux actions, error handling,
and validations. Likewise, we'll have to write Django template emails for each
different kind of email django-rest-auth can generate.

Incidentally, the React application currently has a full suite of signup,
signin, password reset, and user profile forms already implemented -- so in
this case we would have adapt these components & their Redux actions to use
django-rest-auth rather than Firebase.

##### Django User Model

Using django-rest-auth rather than a Auth0 will require the application to have
a thicker User model and to store user logins and passwords. It's potentially
risky to store this data, and since the application's user-base is likely
international in scope, there will likely have some GDPR consequences.

##### Social Login

django-rest-auth does have [social login capabilities][django-rest-auth-social],
but it's not a feature we've used before and the documentation indicates only
support for Twitter and Facebook.

### Auth0

[Auth0][auth0] is a third-party identity platform which provides user sign-up,
sign-in, and management along with add-ons like email and multi-factor
authentication. Two of its selling points are its ability to abstract away many
of the painful parts of dealing with user management and its vast array of
integrations, which enable it to work for single page apps, mobile apps, APIs,
and even ["machine-to-machine applications"][auth0-machine], like command line
tools.

Civic Apps has previously used Auth0 on a few small client-only React
applications. Raster Foundry has more extensive experience using Auth0.

#### Pros

##### Reduced UI Boilerplate

Auth0 provides a nearly drop-in UI for sign-up, sign-in, and password reset. The
Auth0 site has a [tutorial React project][auth0-react], and the general idea is
that a React app would include an AuthService class and a couple of required
routes, then clicking a button to "Sign In" or "Login" would move the user over
to Auth0 to sign in via its user interface.

This means that React apps using Auth0 do not have to implement their own form
components and Redux apparatus for handling sign-in.

Auth0 also provides a mechanism whereby the redirect would be to an internal
URL -- say, from http://example.com to http://auth.example.com.

##### Social Login

Along with username/password combinations, Auth0 has out of the box support for
logging in via Google, and [extended support for numerous other identity
providers][auth0-social] including GitHub and Weibo. Configuring a new identity
provider option typically entails setting up a new application on each provider
site, but appears to work automatically afterwards.

##### Thin Django User Model

Since Auth0 presumably would store data related to user logins, profiles, and
permissions, our resulting Django User model could be very thin: essentially it
would just gather whatever ID Auth0 provides together with an API key token and
a foreign key to a Group.

(This is also roughly how the legacy API's `keySchema` has been designed.)

##### Pricing

In general, Auth0 seems as if it would be free to use for up to 7000 monthly
active users. Above that number, the price starts to grow linearly. When I
tried out the [Auth0 Pricing Wizard][pricing-wizard] it appeared that about 14k
MAUs cost $269 per month, 28k was about $533 per month, and so on.

These rates seem completely reasonable if we were certain that using Auth0 would
save a lot of developer time.

#### Cons

##### Integration with Django REST Framework API

Along with its guides for using Auth0 with [React][auth0-react] and using Auth0
with [Django REST Framework][auth0-drf], the Auth0 documentation site also has
a guide for integrating Auth0 into an application designed as an [API and a
single page app][api+spa], which is roughly similar to what we'd want to build
here.

While the guide is fairly straightforward to follow, it also seems to indiciate
that there's quite a bit of complexity to manage. The general idea is that when
a user signed in, the React app would get a JWT which it would send to the API.
The API in turn would decode the token to determine whether the user has the
correct set of permissions for whatever request. Differential permissions are
set by configuring a set of roles in the Auth0 web UI, and API endpoints get
decorators to indicate what permissions they require.

##### Permission Classes & Auth0 Dashboard

Auth0 handles differential access by user type via an [authorization extension
][authorization-extension], which enables using the Auth0 dashboard to create
different roles and permissions for users.

By default these are stored in Auth0's [Webtask storage][webtask-storage], but
since that provides only 500kb of storage, there's a numerical limit to the
combinations of users and roles before we'd have to set up an S3 bucket to store
these permissions. The documentation notes that 500kb is roughly equivalent to:

> - 1000 groups and 3000 users, where each user is member of 3 groups
> - 20 groups and 7000 users, where each user is member of 3 groups

In addition: user management would take place through the Auth0 dashboard,
which means people doing user management would have to be given an Auth0 login.

##### API Key Generation

Although it seems like an Auth0-based system may also allow us to use DRF's
[token authentication][drf-token-auth] for API key generation, it's not a
workflow we've set up before. In the Raster Foundry Prediction API application,
API tokens for the main Raster Foundry application were created out of band.

##### Unfamiliarity

As with Firebase, Civic Apps is comparatively unfamiliar with using Auth0 in
production. Civic Apps has used Auth0 on a few small backend-less React
applications but in each case it for a very small set of users known in advance,
which means we did not use the sign-up mechanism.

Across Azavea, Raster Foundry seems to have used Auth0 most extensively. The RF
prediction API application has a DRF API + React SPA Auth0 roughly similar to
what we'd antipate creating here, but that application also seems to have a
small, known set of users. The Raster Foundry main application also uses Auth0,
and the team encountered some friction early on when trying to adapt to changes
Auth0 made to its API.

## Decision

We should use django-rest-auth.

We're familiar enough with django-rest-auth that the work of setting it up will
involve more typing rather than thinking problems. The fact that the React UI
already includes custom sign-up, login, etc form components suggests that it'll
be a bit less cumbersome than it would be if we were starting from scratch.

If we were building a client-only React application which talked to a number of
third party services, I think it'd make more sense to integrate Auth0. However,
since we have a Django backend it seems as it we can leverage the capabilities
Django includes for User management, Django admin, email, and the like.

I'd be interested in trying out Auth0 on a few smaller projects before
committing to using it in a larger one.

## Consequences

As a result of choosing to use django-rest-auth for authentication, we'll need
to plan to include django-rest-auth in the project, register the proper URLs,
and possibly also adjust the initial migration to create our new User model.
We'll also need to adjust the React application's forms to work with the new
auth system.

If we decide to retain any of the existing Firebase user data, we'll also need
to determine how to migrate it. Alternatively, we could also plan to require
users to sign up for new accounts when the new API is up.

[auth0]: https://auth0.com/
[firebase-auth]: https://firebase.google.com/docs/auth/
[django-rest-auth]: https://github.com/Tivix/django-rest-auth
[django-rest-auth-intro]: https://django-rest-auth.readthedocs.io/en/latest/introduction.html
[drf-token-auth]: https://www.django-rest-framework.org/api-guide/authentication/#tokenauthentication
[django-rest-auth-social]: https://django-rest-auth.readthedocs.io/en/latest/installation.html?highlight=social%20login#social-authentication-optional
[auth0-social]: https://auth0.com/docs/identityproviders
[auth0-react]: https://auth0.com/docs/quickstart/spa/react/01-login
[auth0-machine]: https://auth0.com/docs/applications/machine-to-machine
[api+spa]: https://auth0.com/docs/architecture-scenarios/spa-api
[auth0-drf]: https://auth0.com/docs/quickstart/backend/django/01-authorization
[authorization-extension]: https://auth0.com/docs/extensions/authorization-extension/v2#how-to-install
[webtask-storage]: https://auth0.com/docs/extensions/authorization-extension/v2/implementation/installation#webtask-storage
[pricing-wizard]: https://auth0.com/pricing-wizard
