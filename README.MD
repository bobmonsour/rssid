# rssid: generating permanent and unique RSS feed IDs

What was sparked by a blog post has now turned into this tool called 'rssid.' So, what problem does it solve?

[My blog](https://bobmonsour.com/) is built with [11ty](https://www.11ty.dev/), a static site generator. When generating an RSS feed using the [sample templates in the docs](https://www.11ty.dev/docs/plugins/rss/#sample-feed-templates), it uses the `absolutePostUrl` for the `<id>` field for each entry. The problem with this is that if you reorganize your site such that your posts have a new URL, your RSS feed will identify the posts as being new. The same is true if your permalink is based on the title of the post and you change the title.

This is not always a problem, nor is it a problem for everyone. But if you wish to retain the ultimate in flexibility of reorganizing your source directories or changing the titles or filenames of your posts, then you need a way to generate a permanent and unique ID for each post.

This is where `rssid` comes in. It is a node script that will generate a unique id at the time that you create the post. It will add an item to your YAML front matter that consists of the md5 hash of the filename.

And rather than forcing you to do this for each and every file, it is capable of adding the rssid item to all the files in a directory. You can specify its use for a single file, or ask that it process all the files in the current directory. You can also specify what file extension should be processed. It defaults to processing all `.md` files, but you specify a specific file extension and then all of the files with that extension will be processed (again, only those in the current directory).
