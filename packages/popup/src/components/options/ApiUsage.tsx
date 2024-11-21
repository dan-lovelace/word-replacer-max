import { useMemo } from "preact/hooks";

import axios, { AxiosRequestConfig } from "axios";

import { useQuery } from "@tanstack/react-query";

import { cx } from "@worm/shared";
import { getApiEndpoint } from "@worm/shared/src/api";
import { getAccessToken } from "@worm/shared/src/browser";
import { ApiAccountUsageResponse, ApiResponse } from "@worm/types/src/api";

import { useLanguage } from "../../lib/language";
import { useAuth } from "../../store/Auth";

import Alert from "../Alerts";
import ContactSupportLink from "../button/ContactSupportLink";
import MaterialIcon from "../icon/MaterialIcon";
import Tooltip from "../Tooltip";

const PROGRESS_BAR_WIDTH_PX = 220;

export default function ApiUsage() {
  const { currentUser } = useAuth();
  const language = useLanguage();

  const {
    data: dataResponse,
    error: errorResponse,
    isLoading,
  } = useQuery<
    AxiosRequestConfig,
    ApiResponse<ApiAccountUsageResponse>,
    ApiResponse<ApiAccountUsageResponse>
  >({
    enabled: Boolean(currentUser),
    queryKey: ["getAccountUsage"],
    queryFn: async () =>
      axios.get(getApiEndpoint("GET:accountUsage"), {
        headers: {
          Authorization: `Bearer ${await getAccessToken()}`,
        },
      }),
  });

  if (isLoading) {
    return (
      <div className="spinner-grow spinner-grow-sm" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    );
  }

  if (errorResponse) {
    const message =
      errorResponse?.error?.details ?? language.api.account.usage.GENERAL_ERROR;

    return <Alert severity="danger">{message}</Alert>;
  }

  const suggestData = dataResponse?.data?.data?.["POST:suggest"];

  if (!suggestData) {
    return (
      <Alert severity="danger">
        {language.api.account.usage.GENERAL_ERROR}
      </Alert>
    );
  }
  const {
    count,
    limit: { period, threshold },
  } = suggestData;

  const usagePercent = Math.ceil((count / threshold) * 100);
  const isWarning = Boolean(usagePercent > 80);

  const barColor = useMemo(() => {
    if (usagePercent >= 100) {
      return "bg-danger-subtle";
    } else if (usagePercent >= 70) {
      return "bg-warning-subtle";
    }

    return "bg-success-subtle";
  }, [usagePercent]);

  return (
    <div data-testid="api-usage">
      <div className="mb-1">
        <div
          className="d-flex align-items-center gap-1 fs-sm"
          style={{ maxWidth: PROGRESS_BAR_WIDTH_PX }}
        >
          <span className="flex-fill">
            Usage: {count} / {threshold}
          </span>
          <Tooltip title={`In the last ${period.value} ${period.interval}`}>
            <MaterialIcon
              className="text-body-tertiary"
              name="info"
              size="sm"
            />
          </Tooltip>
        </div>
        <div
          className="d-flex align-items-center gap-2"
          style={{ maxWidth: PROGRESS_BAR_WIDTH_PX }}
        >
          <div
            aria-label="Replacement suggestion usage"
            className="progress flex-fill"
            role="progressbar"
            style={{
              borderRadius: 2,
              height: 12,
            }}
          >
            <div
              className={cx("progress-bar", barColor)}
              style={{ width: `${usagePercent}%` }}
            />
          </div>
        </div>
      </div>
      {isWarning && (
        <div
          className={cx(
            "d-flex align-items-center",
            "fs-xs text-secondary text-nowrap"
          )}
          data-testid="refill-alert-message"
        >
          <span>Need additional credits?</span>
          &nbsp;
          <ContactSupportLink className="text-decoration-none fs-xs">
            Contact support
          </ContactSupportLink>
          &nbsp;
          <span>and we'll extend your limit.</span>
        </div>
      )}
    </div>
  );
}
