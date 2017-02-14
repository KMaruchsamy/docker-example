import { Cli31Page } from './app.po';

describe('cli31 App', function() {
  let page: Cli31Page;

  beforeEach(() => {
    page = new Cli31Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
