import { useLocalStorageState } from "lib/hooks/use-local-storage-state"
import { RunFrameWithApi } from "../RunFrameWithApi/RunFrameWithApi"
import { RunframeCliLeftHeader } from "./LeftHeader"

export const RunFrameForCli = (props: { debug?: boolean, defaultToFullScreen?:boolean }) => {
  const [shouldLoadLatestEval, setLoadLatestEval] = useLocalStorageState(
    "load-latest-eval",
    true,
  )
  return (
    <RunFrameWithApi
      debug={props.debug}
      defaultToFullScreen={props.defaultToFullScreen ?? true}
      forceLatestEvalVersion={shouldLoadLatestEval}
      leftHeaderContent={
        <div className="rf-flex">
          <RunframeCliLeftHeader
            shouldLoadLatestEval={shouldLoadLatestEval}
            onChangeShouldLoadLatestEval={(newShouldLoadLatestEval) => {
              setLoadLatestEval(newShouldLoadLatestEval)
              globalThis.runFrameWorker = null
            }}
          />
        </div>
      }
    />
  )
}
