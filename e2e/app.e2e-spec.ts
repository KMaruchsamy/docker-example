import { CLI21Page } from './app.po';

describe('cli21 App', function() {
  let page: CLI21Page;

  beforeEach(() => {
    page = new CLI21Page();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
