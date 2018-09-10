# Foundation for Emails Template

[![devDependency Status](https://david-dm.org/zurb/foundation-emails-template/dev-status.svg)](https://david-dm.org/zurb/foundation-emails-template#info=devDependencies)

**Please open all issues with this template on the main [Foundation for Emails](http://github.com/zurb/foundation-emails/issues) repo.**

This project is based on the official starter project for [Foundation for Emails](http://foundation.zurb.com/emails), a framework for creating responsive HTML devices that work in any email client. It has a Gulp-powered build system with these features:

- Pug templating engine
- Simplified HTML email syntax with [Inky](http://github.com/zurb/inky)
- Sass compilation
- Built-in BrowserSync server
- Full email inlining process

## Installation

To use this template, your computer needs [Node.js](https://nodejs.org/en/) 0.12 or greater. The template can be installed with the Foundation CLI, or downloaded and set up manually.

### Manual Setup

To manually set up the template, first download it with Git:

```bash
git clone https://github.com/collishop/mailtemplate.git
```

Then open the folder in your command line, and install the needed dependencies:

```bash
cd projectname
npm install
```

## Build Commands

Run `npm start` to kick off the build process. A new browser tab will open with a server pointing to your project files.

Run `npm run build` to inline your CSS into your HTML along with the rest of the build process.

Run `npm run zip` to build as above, then zip HTML and images for easy deployment to email marketing services.

## mixins

- tiles
  takes an object with following structure:
  {
  image: "imagename without extension",
  discount: "imagename without extension - resulting in discount-image",
  categorie1: "string",
  categorie2: "string",
  cta: "string",
  link: "url"
  }
- legals
  takes an array of following structure (each legal on a seperate line)
  ["string 1", "string 2", "string 3"]
