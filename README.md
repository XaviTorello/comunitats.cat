# Comunitats.CAT PoC

This provides a proof of concept for the [Comunitats.CAT](https://test.comunitats.cat) site. It's hosted on Github and uses a scheduled Github Action to fetch, parse and store all new Meetup events in [`calendarEntries.json`](src/calendarEntries.json).

To add new Meetup groups, just create a new entry in [`meetups.json`](src/meetups.json). In the next scheduled CI execution the app will be populated with their events automatically!

## Development

If needed install globally parcel with:

```
yarn global add parcel-bundler`
```

### Local development

Start dev server with:

```
yarn start
```

### Build

```
yarn build
```
