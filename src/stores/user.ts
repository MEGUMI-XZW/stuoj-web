import { computed, ref, watchEffect} from "vue";
import { ROLE, type BaseUserInfo } from "@/types/User";
import { GetUserInfo, GetId } from "@/apis/user";
import { createGlobalState, useStorage } from "@vueuse/core";

export const userStore = createGlobalState(() => {
  const { execute: getIdExecute } = GetId();
  const { execute } = GetUserInfo();

  const token = useStorage("token", "");

  const updateToken = (_token: string) => {
    token.value = _token;
  };
  const clearToken = () => {
    token.value = "";
  };

  const id = ref(0);
  const isLogin = computed(() => token.value !== "");
  const info = ref<BaseUserInfo>({
    avatar: "",
    create_time: "",
    email: "",
    id: 0,
    role: ROLE.Visitor,
    update_time: "",
    username: "未登录",
  });

  const getId = async () => {
    if(!isLogin.value)
      return;
    const state = await getIdExecute(
      {
        headers: {
          Authorization: `Bearer ${token.value}`
        }
      }
    )
    if (state.value) {
      id.value = state.value.data as number;
    }
  };


  const getUserInfo = async (userInfo?: BaseUserInfo) => {
    if(!isLogin.value)
      return;
    if (userInfo) {
      info.value = userInfo;
    } else {
      if (id.value === 0) {
        await getId();
      }
      const state = await execute({
        headers: {
          Authorization: `Bearer ${token.value}`
        },
        url: "/" + id.value.toString()
      });
      if (state.value) {
        info.value = state.value.data as BaseUserInfo;
      }
    };
  };

  return {
    getId,
    getUserInfo,
    id,
    info,
    token,
    updateToken,
    isLogin,
    clearToken,
  };
});