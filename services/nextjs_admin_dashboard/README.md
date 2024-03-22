# NextJS_Admin_Dashboard

This application is the dev platform for managing database items on a connected DB. It has admin privileges and can override any permissions or check manually. This is a nextjs app that is packaged and distributed for internal use and should not be exposed on an public net. 

## Getting started

- Install dependencies with `yarn`
- Add a `<dashboard_root_dir>/.env` file with `DB_CONNECTION=postgresql://postgres:postgres@localhost:54311/postgres` (assuming your using the local docker-compose dev environment)
- run the project with `yarn dev` and goto [http://localhost:4002/](http://localhost:4002/)

## Technologies

- [nextjs](https://nextjs.org/docs) - a React framework for building and maintaining apps
- [tailwind](https://tailwindcss.com/docs/installation) - a css library for styling
- [shadcn](https://ui.shadcn.com/docs) - a UI library that downloads components locally from the project's registry
- [Cypress](https://docs.cypress.io/api/table-of-contents) - a e2e and component testing lib that runs inside a real browser (TODO: install and setup)

## Component convention

The convention is as follows:
- all components will be "name-by-domain" and "PascalCased"
  - Eg: `AccountDropdown`, `GroupsTable`, `DocumentForm`, etc
  - format is thus "<Model><UIComponent>"
    - if the UI Component is multiple words then it goes by usecase
    - `DropdownItem` or `ItemDropdown` --> "DropdownItem" because it is an "item" of a "dropdown", not a dropdown of an item
- Each component will be a single file named identical to it's component
  ```ts
  // `~/components/AccountDropdown.js`
  

  export default AccountDropdown;
  ```
- if a component is refactored to have an external resource (like a helper or util) it will be added to the `~/libs/` dir and named `~/libs/use<ComponentName>`
- tests for each component will go into `~/components/__tests__` to keep the folder clean and easy to navigate