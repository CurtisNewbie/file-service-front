# file-service-front v1.2.1

Angular frontend for file-service and fantahsea.

**Requirements:**

- file-server >= [v1.2.5.4](https://github.com/CurtisNewbie/file-server/tree/v1.2.5.4)
- auth-service >= [v1.1.3.1](https://github.com/CurtisNewbie/auth-service/tree/v1.1.3.1)
- fantahsea >= [v1.0.3.5](https://github.com/CurtisNewbie/fantahsea/tree/v1.0.3.5) (optional, webpage for fantahsea can be disabled in environment.prod.ts, it's enabled by default)
- auth-gateway >= [v1.0.6](https://github.com/CurtisNewbie/auth-gateway/tree/v1.0.6) (no direct dependency, but of course you will need it)
- goauth >= [v1.0.0](https://github.com/CurtisNewbie/goauth/tree/v1.0.0)

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

## Known Issue (fixed tho)

ngx-lightbox2 is used in this project. When image rotate, the background may be out-of-sync with the image's rotation, as a result, we can see the white background behind the image. After some investigation, I personally think that this may be caused by the attribute `text-align: center` in class `.lightbox` in `node_modules/ngx-lightbox/lightbox.css` (there may be some conflicts, I am not sure). Removing it somehow fixed the issue :D, so this attribute is overriden in `gallery-image.component.css`. 

```css
.lightbox {
  position: absolute;
  left: 0;
  width: 100%;
  z-index: 10000;
  text-align: center;
  line-height: 0;
  font-weight: normal;
  box-sizing: content-box;
  outline: none;
}
```
