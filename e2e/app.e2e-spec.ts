import { Cli21Page } from './app.po';

describe('cli21 App', function() {
  let page: Cli21Page;

  beforeEach(() => {
    page = new Cli21Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
