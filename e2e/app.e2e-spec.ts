import { ClilatestPage } from './app.po';

describe('clilatest App', () => {
  let page: ClilatestPage;

  beforeEach(() => {
    page = new ClilatestPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
