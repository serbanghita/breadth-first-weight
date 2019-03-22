import * as React from "react";
const storageRawData = require("../../reports/weretail-global-prod.adobecqms.net/1553246599352/storage.json");
import { IHttpCrawlerStorageItem } from "../../src/lib/HttpCrawler";
import { getHrefWithoutOrigin } from "../../src/lib/Utility";

interface IReportAppState {
    dataMap: Map<string, IHttpCrawlerStorageItem>;
}

export default class ReportApp extends React.Component<{}, IReportAppState> {

    public componentWillMount() {
        this.setState({ dataMap: new Map(storageRawData) });
    }

    public onSort(e: React.MouseEvent, sortName: string) {
        e.preventDefault();

        if ([
            "JSEventListeners", "Nodes", "LayoutCount", "RecalcStyleCount",
            "LayoutDuration", "RecalcStyleDuration", "ScriptDuration",
            "TaskDuration", "JSHeapUsedSize", "JSHeapTotalSize"
        ].indexOf(sortName) !== -1
        ) {
            const dataArray = [...this.state.dataMap];
            dataArray.sort((a, b) => {
                const ma = a[1].metrics[sortName] || 0;
                const mb = b[1].metrics[sortName] || 0;
                if (ma > mb) {
                    return -1;
                }
                if (ma < mb) {
                    return 1;
                }
                return 0;
            });
            this.setState({ dataMap: new Map(dataArray) });
        }
    }

    public render() {
        const reportItems = [...this.state.dataMap].map((tuple: [string, IHttpCrawlerStorageItem], index: number) => {
            const [itemURL, itemData] = tuple;

            const consoleMsgsText = itemData.consoleEvents.filter((event) => {
                return !(
                    event.type === "browser" &&
                    event.text === "Failed to load resource: the server responded with a status of 404 (Not Found)"
                );
            })
                .map((event, eventIndex) => {
                    const eventDetails = event.details ? `${event.details.method} ${event.details.httpStatusCode} ${event.details.uri}` : ``;
                    return (
                        <React.Fragment key={eventIndex}>
                            <mark className={event.level}>{event.level}</mark> {event.type} {event.text} {eventDetails} {"\n\r"}
                        </React.Fragment>
                    );
                });


            const consoleMsgs = (
                <React.Fragment>
                    <pre><code>
                        {consoleMsgsText}
                    </code></pre>
                </React.Fragment>
            );

            let statusStyle = "";
            if (itemData.status === 200) {
                statusStyle = `status-2xx`;
            } else if (itemData.status >= 400) {
                statusStyle = `status-4xx`;
            } else {
                statusStyle = `status-other`;
            }

            return (
                <React.Fragment key={index}>
                    <tr className="linkRow">
                        <td><a href={itemURL} target="_blank">{getHrefWithoutOrigin(new URL(itemURL))}</a></td>
                        <td>{itemData.weight}</td>
                        <td>{itemData.depth}</td>
                        <td>{itemData.linksTotal}</td>
                        <td className={statusStyle}>{itemData.status}</td>
                        <td>{itemData.metrics.JSEventListeners}</td>
                        <td>{itemData.metrics.Nodes}</td>
                        <td>{itemData.metrics.LayoutCount}</td>
                        <td>{itemData.metrics.RecalcStyleCount}</td>
                        <td>{itemData.metrics.LayoutDuration}</td>
                        <td>{itemData.metrics.RecalcStyleDuration}</td>
                        <td>{itemData.metrics.ScriptDuration}</td>
                        <td>{itemData.metrics.TaskDuration}</td>
                        <td>{itemData.metrics.JSHeapUsedSize}</td>
                        <td>{itemData.metrics.JSHeapTotalSize}</td>
                        <td className="consoleMsgs">{consoleMsgs}</td>
                    </tr>
                </React.Fragment >
            );
        });

        return (
            <div>
                <h1>Report</h1>
                <p>A static report of links crawled.</p>

                <table>
                    <thead>
                        <tr>
                            <th>URL</th>
                            <th>Weight</th>
                            <th>Depth</th>
                            <th>Links found</th>
                            <th>HTTP Status</th>
                            <th colSpan={10} align={"center"}>Metrics</th>
                            <th rowSpan={2}>Console Msgs</th>
                        </tr>
                        <tr>
                            <th colSpan={5} />
                            <th onClick={(e) => this.onSort(e, "JSEventListeners")}>JSEventListeners</th>
                            <th onClick={(e) => this.onSort(e, "Nodes")}>Nodes</th>
                            <th onClick={(e) => this.onSort(e, "LayoutCount")}>LayoutCount</th>
                            <th onClick={(e) => this.onSort(e, "RecalcStyleCount")}>RecalcStyleCount</th>
                            <th onClick={(e) => this.onSort(e, "LayoutDuration")}>LayoutDuration</th>
                            <th onClick={(e) => this.onSort(e, "RecalcStyleDuration")}>RecalcStyleDuration</th>
                            <th onClick={(e) => this.onSort(e, "ScriptDuration")}>ScriptDuration</th>
                            <th onClick={(e) => this.onSort(e, "TaskDuration")}>TaskDuration</th>
                            <th onClick={(e) => this.onSort(e, "JSHeapUsedSize")}>JSHeapUsedSize</th>
                            <th onClick={(e) => this.onSort(e, "JSHeapTotalSize")}>JSHeapTotalSize</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {reportItems}
                    </tbody>
                </table>

            </div >
        );
    }
}