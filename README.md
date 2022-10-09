# file-service-front v1.1.14

Angular frontend for file-service and fantahsea.

**Requirements:**

- file-server >= [v1.2.4](https://github.com/CurtisNewbie/file-server/tree/v1.2.4)
- auth-service >= [v1.1.3.1](https://github.com/CurtisNewbie/auth-service/tree/v1.1.3.1)
- fantahsea >= [v1.0.3.1](https://github.com/CurtisNewbie/fantahsea/tree/v1.0.3.1) (optional, webpage for fantahsea can be disabled in environment.prod.ts, it's enabled by default)
- auth-gateway >= [v1.0.6](https://github.com/CurtisNewbie/auth-gateway/tree/v1.0.6) (no direct dependency, but of course you will need it)

## Update

Since v1.1.13, components for managing tasks and task histories have been removed, these are available in auth-service-front >= [v1.1.4](https://github.com/curtisnewbie/auth-service-front/tree/v1.1.4). 

## How to Disable Fantahsea

Go to `environments/environment.prod.ts`. 

Change the `environment` variable, from:

```ts
export const environment = {
  // ...
  services: [fileServiceOpt, fantahseaOpt],
  // ...
};
```

to this:

```ts
export const environment = {
  // ...
  services: [fileServiceOpt],
  // ...
};
```

