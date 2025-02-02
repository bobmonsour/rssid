# rssid: generating permanent and unique RSS entry IDs

## February 2, 2025 - An update that fully automates this process

Here are all the writings from my site about the problem and my journey to solve it:

- [On RSS entry IDs](/til/on-rss-entry-ids/), _Jan 25, 2025_
- [Much more to come on RSS entry IDs](/til/much-more-to-come-on-rss-entry-ids/), _Jan 26, 2025_
- [Creating quasi-permanently unique entry IDs for RSS](/blog/creating-permanently-unique-entry-id-for-rss/), _Jan 27, 2025_
- [My last word on RSS entry IDs](/blog/even-more-on-rss-ids/), _Jan 30, 2025_
- [Prepare for a minor flood of RSS entries](/til/prepare-for-a-minor-flood-of-rss-entries/), _Jan 31, 2025_
- [I wanted to validate the presence of an rssid in my front matter](/til/i-wanted-to-validate-the-presence-of-an-rssid-in-my-front-matter/), _Feb 1, 2025_
- [Ok, this is my 'final' final word on RSS entry IDs](/blog/final-final-word-on-rss-entry-ids/), _Feb 2, 2025_

That last entry shows the fully automated version of the solution.

## Why?

What was sparked by [a blog post](https://darthmall.net/2025/on-the-importance-of-stable-ids/) and [my blog post responding to it](https://bobmonsour.com/blog/creating-permanently-unique-entry-id-for-rss/) has now turned into this tool called 'rssid.' So, what problem does it solve?

[My personal site](https://bobmonsour.com/) is built with [11ty](https://www.11ty.dev/), a static site generator. When generating an RSS feed using the [sample templates in the docs](https://www.11ty.dev/docs/plugins/rss/#sample-feed-templates), it uses the `absolutePostUrl` for the `<id>` field for each entry. The problem with this is that if you reorganize your site such that your posts have a new URL, your RSS feed will identify the posts as being new since the `<id>` has changed. The same is true if a permalink is derived from the title of the post and you change the title.

This is not always a problem, nor is it a problem for everyone. For example, on the [11ty Bundle Blog](https://11tybundle.dev/blog/), I never expect to ever change how it's organized. As a result, I don't need to worry about the `<id>` field in the RSS feed.

But if you wish to retain the ultimate in flexibility of reorganizing your source directories or changing the permalinks of your posts, then you need a way to generate a permanent and unique ID for each post...at the time that you create the post.

This is where this `rssid` tool comes in. It is a node script that will generate a unique id at the time that you create the post. It is a manual process, but it's incredibly simple to use. It will add an item to your YAML front matter that consists of the md5 hash of the filename.

SPECIAL NOTE: It assumes that you're using YAML front matter. If you're not, you can stop reading, unless your just curious.

You can use the command on a single file, which is ideal for creating the rssid at the time you create the file (assuming that it already has some YAML front matter in it). Or you can ask that it process all the files in the current directory. You can specify what file extension should be processed. It defaults to processing all `.md` files in a directory, but you specify a specific file extension and then all of the files with that extension will be processed. It only processes the files in the current directory.

## How to use it?

If you want to use it, I suggest the following. This works on macOS. I don't know how to do steps 3 and 4 on Windows, but I'm sure it's possible. And I'm assuming that the steps for Linux are similar to that for macOS.

1. Download this repo to a directory.
2. Change to that directory and run `npm install`. This will install all the few dependencies listed in the package.json.
3. Create a sym link to the script in a directory that is in your path. I have a directory called `/usr/local/bin` that is in my path. I created a sym link to the script in that directory. On macOS you can do this with the following command:

`ln -s /path/to/rssid.js /usr/local/bin/rssid`

4. Change the script to be executable with the command:

`chmod +x <your path to the directory containing rssid.js>/rssid.js`

Now you can run the script from any directory.

To add an rssid element to the YAML in all of your markdown files in the current directory, change to that directory and run the command: `rssid -a`. If you think you made a mistake and want to undo it, simply run the command: `rssid -r`.

If you want to see all the available options, run the command: `rssid -h`. You'll get the following output:

```bash
Usage: rssid [options]

Options:
-h, -help Display this help message
-a, -add Add the rssid item to the front matter
-r, -remove Remove the rssid item from the front matter
-e=<ext> Process all files with this extension (.md if not specified)
-f=<filename> Process the specified file (.md extension if not specified)

Either -a or -r (or -add or -remove) MUST be specified. In the absence of
the -e=<ext> or the -f=<filename> option, all .md files will be processed.

This command operates ONLY on files in the current directory. It adds
or removes a YAML front matter item named "rssid" that is the md5 hash
of the full filename (including the extension) for the file(s) processed.
If the file(s) contain no YAML front matter, an error is noted, yet
other files will still be processed as needed.
```

Once you have created a unique rssid element in your YAML, you'll need to update your feed template(s) to use it. As Evan noted in [his post](https://darthmall.net/2025/on-the-importance-of-stable-ids/), and as I did [in mine](https://bobmonsour.com/blog/creating-permanently-unique-entry-id-for-rss/), a solid approach is to use the [tag URI scheme](https://en.wikipedia.org/wiki/Tag_URI_scheme). The general format of such URIs is:

`"tag:" authorityName "," YYYY-MM-DD-date ":" specific [ "#" fragment ]`

For example, the `<id>` line in the sample feed templates look like this:

`<id>{{ absolutePostUrl }}</id>`

Here's what I do in my own feed template:

`<id>tag:bobmonsour.com,{{ post.date | toDateString }}:{{ post.data.rssid }}</id>`

Note that 11ty converts the yyyy-mm-dd to a javascript date, so I created a filter to retain the YAML date that I originally entered in the post.

Once you do that, your RSS feed will have a permanent and unique ID for each entry. Here's an example from one of my posts:

`<id>tag:bobmonsour.com,2025-01-27:fbd41eaa4a5f32d6844c4acf4346b82e</id>`

That's about it. If you have questions, you can find my email address in the package.json file.
