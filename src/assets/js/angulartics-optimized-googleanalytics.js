
var _gaq = _gaq || [];
if (window.location.hostname === 'nit.kaplan.com')
    _gaq.push(['_setAccount', 'UA-72468900-1']);
else if (window.location.hostname === 'qa-nit.kaplan.com')
    _gaq.push(['_setAccount', 'UA-72468900-2']);
_gaq.push(['_trackPageview']);
          (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
if (window.location.hostname === 'nit.kaptest.com') {
    ga('create', 'UA-72468900-1', 'auto');
}    
else if (window.location.hostname === 'qa.nit.kaptest.com') {
     ga('create', 'UA-72468900-2', 'auto');
}
