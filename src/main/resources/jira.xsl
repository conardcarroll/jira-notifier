<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0">
    <xsl:output indent="no" omit-xml-declaration="yes"/>
    <xsl:template match="/rss/channel">
        <div>
            <table id="header" width="100%">
                <tr>
                    <td>
                        <span onclick="openJiraTab(getJiraUrl());">
                            <xsl:attribute name="class">
                                <xsl:value-of select="local-name(title)"/>
                            </xsl:attribute>
                            <xsl:value-of select="title"/>
                        </span>
                    </td>
                    <td>
                        <input id="quick-search" onchange="if (value != '') quickSearch();" placeholder="Quick Search" />
                    </td>
                </tr>
            </table>
            <xsl:choose>
                <xsl:when test="count(item) = 0">
                    <div>
                        <xsl:attribute name="class">
                            <xsl:text>message</xsl:text>
                        </xsl:attribute>
                        <xsl:text>You have no issues.</xsl:text>
                    </div>
                </xsl:when>
                <xsl:otherwise>
					<xsl:variable name="total" select="/rss/channel/issue/@total"/>
					<xsl:variable name="start" select="/rss/channel/issue/@start"/>
					<xsl:variable name="end" select="/rss/channel/issue/@end"/>
					<xsl:if test="$total &gt; 10">
						<table width="100%" style="table-layout:fixed">
							<tr>
								<td>
									<xsl:if test="$start &gt; 0">
										<span class="link" style="float:left">
											<xsl:attribute name="onclick">
												<xsl:text>setContent(</xsl:text>
												<xsl:value-of select="$start - 10"/>
												<xsl:text>, "right", "left");</xsl:text>
											</xsl:attribute>
											<xsl:text>&lt; Prev</xsl:text>
										</span>
									</xsl:if>
								</td>
								<td align="center" height="19px">
									<xsl:if test="$total &gt; 10">
										<span style="align:center" id="count">
											<xsl:value-of select="$start + 1"/>
											<xsl:text>-</xsl:text>
											<xsl:value-of select="$end"/>
											<xsl:text> of </xsl:text>
											<xsl:value-of select="$total"/>
										</span>
									</xsl:if>
								</td>
								<td>
									<xsl:if test="$end &lt; $total">
										<span class="link" style="float:right">
											<xsl:attribute name="onclick">
												<xsl:text>setContent(</xsl:text>
												<xsl:value-of select="$start + 10"/>
												<xsl:text>, "left", "right");</xsl:text>
											</xsl:attribute>
											<xsl:text>Next &gt;</xsl:text>
										</span>
									</xsl:if>
								</td>
							</tr>
						</table>
					</xsl:if>
                    <table width="100%" id="items">
                        <tr class="alternate">
                            <th>T</th>
                            <th>Key</th>
                            <th>Summary</th>
                            <th>Pr</th>
                        </tr>
                        <xsl:apply-templates select="item" />
                    </table>
					<div id="spacer" style="display: none" class="message">
					</div>
                </xsl:otherwise>
            </xsl:choose>
        </div>
    </xsl:template>
    
    <xsl:template match="item">
        <xsl:variable name="descLen" select="count(../item) * 50" />
        <tr>                                
            <xsl:if test="position() mod 2 = 0">
                <xsl:attribute name="class">
                    <xsl:text>alternate</xsl:text>
                </xsl:attribute>
            </xsl:if>
            <td align="center">			
				<xsl:attribute name="title">
					<xsl:value-of select="type/text()"/>
				</xsl:attribute>
                <img>
                    <xsl:attribute name="src">
                        <xsl:value-of select="type/@iconUrl"/>
                    </xsl:attribute>
                </img>
            </td>
            <td class="bold link" align="center">
                <xsl:attribute name="onclick">
                    <xsl:text>openJiraTab('</xsl:text>
                    <xsl:value-of select="link"/>
                    <xsl:text>')</xsl:text>
                </xsl:attribute>
                <span>
                    <xsl:value-of select="key"/>
                </span>
            </td>
            <td class="link">
                <xsl:attribute name="title">
                    <xsl:value-of select="substring(description, 0, $descLen)"/>
					<xsl:if test="string-length(description) &gt; $descLen">
						<xsl:text>...</xsl:text>
					</xsl:if>
                </xsl:attribute>
                <xsl:attribute name="onclick">
                    <xsl:text>openJiraTab('</xsl:text>
                    <xsl:value-of select="link"/>
                    <xsl:text>')</xsl:text>
                </xsl:attribute>
                <span>
                    <xsl:value-of select="summary"/>
                </span>
            </td>
            <td align="center">			
				<xsl:attribute name="title">
					<xsl:value-of select="priority/text()"/>
				</xsl:attribute>
                <img>
                    <xsl:attribute name="src">
                        <xsl:value-of select="priority/@iconUrl"/>
                    </xsl:attribute>
                </img>
            </td>
        </tr>
    </xsl:template>
</xsl:stylesheet>
